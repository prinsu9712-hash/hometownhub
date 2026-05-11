import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import Layout from "../components/Layout";
import API, { API_ORIGIN, getApiErrorMessage, getUploadUrl } from "../api";
import { AuthContext } from "../context/AuthContext";
import {
  CheckCircleIcon,
  MailIcon,
  SearchIcon,
  SparkIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon
} from "../components/Icons";

const Avatar = ({ user, size = "h-11 w-11" }) => {
  const photoUrl = user?.profilePhoto ? getUploadUrl(user.profilePhoto) : "";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={user?.name ? `${user.name} profile` : "Profile"}
        className={`${size} flex-shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${size} flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand2 text-sm font-bold text-white`}
    >
      {(user?.name || "U").slice(0, 1).toUpperCase()}
    </span>
  );
};

const getRequestPerson = (request, type) =>
  type === "incoming" ? request.requester : request.recipient;

function Messages() {
  const { user } = useContext(AuthContext);
  const [friendHub, setFriendHub] = useState({
    friends: [],
    incomingRequests: [],
    outgoingRequests: [],
    people: []
  });
  const [threads, setThreads] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState("");
  const [conversation, setConversation] = useState([]);
  const [search, setSearch] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [pageError, setPageError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingThreadId, setLoadingThreadId] = useState("");
  const selectedFriendIdRef = useRef("");

  useEffect(() => {
    selectedFriendIdRef.current = selectedFriendId;
  }, [selectedFriendId]);

  const fetchFriendHub = useCallback(async (query = "") => {
    try {
      const { data } = await API.get("/friends", {
        params: query.trim() ? { search: query.trim() } : {}
      });
      setFriendHub({
        friends: Array.isArray(data?.friends) ? data.friends : [],
        incomingRequests: Array.isArray(data?.incomingRequests) ? data.incomingRequests : [],
        outgoingRequests: Array.isArray(data?.outgoingRequests) ? data.outgoingRequests : [],
        people: Array.isArray(data?.people) ? data.people : []
      });
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to load friends."));
    }
  }, []);

  const fetchThreads = useCallback(async () => {
    try {
      const { data } = await API.get("/messages/threads");
      setThreads(Array.isArray(data?.threads) ? data.threads : []);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to load message threads."));
    }
  }, []);

  const fetchConversation = useCallback(async (friendId) => {
    if (!friendId) {
      setConversation([]);
      return;
    }

    try {
      setLoadingThreadId(friendId);
      const { data } = await API.get(`/messages/${friendId}`);
      setConversation(Array.isArray(data?.messages) ? data.messages : []);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to load conversation."));
      setConversation([]);
    } finally {
      setLoadingThreadId("");
    }
  }, []);

  useEffect(() => {
    fetchFriendHub();
    fetchThreads();
  }, [fetchFriendHub, fetchThreads]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFriendHub(search);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [fetchFriendHub, search]);

  useEffect(() => {
    if (!selectedFriendId && threads.length > 0) {
      setSelectedFriendId(threads[0].friend?._id || "");
    }
  }, [selectedFriendId, threads]);

  useEffect(() => {
    fetchConversation(selectedFriendId);
  }, [fetchConversation, selectedFriendId]);

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = io(API_ORIGIN, {
      transports: ["websocket", "polling"]
    });

    socket.emit("joinUserRoom", user._id);

    const refreshMessaging = ({ message } = {}) => {
      fetchThreads();
      const selectedId = selectedFriendIdRef.current;

      if (
        selectedId &&
        (String(message?.sender?._id || message?.sender) === String(selectedId) ||
          String(message?.recipient?._id || message?.recipient) === String(selectedId))
      ) {
        fetchConversation(selectedId);
      }
    };

    socket.on("messages:new", refreshMessaging);
    socket.on("friends:updated", () => {
      fetchFriendHub();
      fetchThreads();
    });

    return () => {
      socket.off("messages:new", refreshMessaging);
      socket.off("friends:updated");
      socket.disconnect();
    };
  }, [fetchConversation, fetchFriendHub, fetchThreads, user?._id]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchThreads();
      if (selectedFriendIdRef.current) {
        fetchConversation(selectedFriendIdRef.current);
      }
    }, 12000);

    return () => clearInterval(intervalId);
  }, [fetchConversation, fetchThreads]);

  const selectedThread = useMemo(
    () => threads.find((thread) => String(thread.friend?._id) === String(selectedFriendId)),
    [selectedFriendId, threads]
  );
  const selectedFriend =
    selectedThread?.friend ||
    friendHub.friends.find((friend) => String(friend._id) === String(selectedFriendId));
  const totalUnread = useMemo(
    () => threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0),
    [threads]
  );

  const sendFriendRequest = async (personId) => {
    try {
      setPageError("");
      setStatusMessage("");
      await API.post(`/friends/request/${personId}`);
      setStatusMessage("Friend request sent.");
      await fetchFriendHub();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to send friend request."));
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      setPageError("");
      setStatusMessage("");
      await API.post(`/friends/requests/${requestId}/${action}`);
      setStatusMessage(action === "accept" ? "Friend request accepted." : "Friend request declined.");
      await Promise.all([fetchFriendHub(), fetchThreads()]);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to update friend request."));
    }
  };

  const removeFriend = async (friendId) => {
    try {
      setPageError("");
      setStatusMessage("");
      await API.delete(`/friends/${friendId}`);
      setStatusMessage("Friend removed.");

      if (String(selectedFriendId) === String(friendId)) {
        setSelectedFriendId("");
        setConversation([]);
      }

      await Promise.all([fetchFriendHub(), fetchThreads()]);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to remove friend."));
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = messageDraft.trim();

    if (!selectedFriendId || !text) return;

    try {
      setIsSending(true);
      setPageError("");
      await API.post(`/messages/${selectedFriendId}`, { text });
      setMessageDraft("");
      await Promise.all([fetchConversation(selectedFriendId), fetchThreads()]);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to send message."));
    } finally {
      setIsSending(false);
    }
  };

  const renderRelationshipAction = (person) => {
    if (person.relationship === "friend") {
      return (
        <button
          type="button"
          className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700"
          onClick={() => setSelectedFriendId(person._id)}
        >
          Message
        </button>
      );
    }

    if (person.relationship === "incoming") {
      return (
        <button
          type="button"
          className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700"
          onClick={() => respondToRequest(person.requestId, "accept")}
        >
          Accept
        </button>
      );
    }

    if (person.relationship === "outgoing") {
      return (
        <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
          Requested
        </span>
      );
    }

    return (
      <button
        type="button"
        className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700"
        onClick={() => sendFriendRequest(person._id)}
      >
        Add friend
      </button>
    );
  };

  return (
    <Layout>
      <section className="aurora-shell p-6 sm:p-8 lg:p-10">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#8d5a34] via-[#b78656] to-[#e39d58] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Messages</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Friend inbox</h2>
          <p className="mt-2 text-sm text-white/90">Send friend requests, accept trusted members, and chat in sync.</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <p className="section-kicker">Friends</p>
            <p className="mt-2 text-2xl font-bold">{friendHub.friends.length}</p>
          </div>
          <div className="stat-card">
            <p className="section-kicker">Requests</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{friendHub.incomingRequests.length}</p>
          </div>
          <div className="stat-card">
            <p className="section-kicker">Unread</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{totalUnread}</p>
          </div>
        </div>

        {pageError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {pageError}
          </div>
        )}

        {statusMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {statusMessage}
          </div>
        )}

        <div className="grid min-h-[620px] gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="section-frame p-4">
              <label className="input-label">
                <SearchIcon className="h-4 w-4" />
                Find members
              </label>
              <input
                className="soft-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or hometown"
              />
            </div>

            {friendHub.incomingRequests.length > 0 && (
              <div className="section-frame p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-900">Friend Requests</p>
                  <span className="metric-pill">{friendHub.incomingRequests.length}</span>
                </div>
                <div className="space-y-3">
                  {friendHub.incomingRequests.map((request) => {
                    const person = getRequestPerson(request, "incoming");
                    return (
                      <div key={request._id} className="rounded-2xl border border-stone-200 bg-white/80 p-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={person} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-stone-900">{person?.name || "Member"}</p>
                            <p className="truncate text-xs text-stone-500">{person?.hometown || person?.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700"
                            onClick={() => respondToRequest(request._id, "accept")}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Accept
                          </button>
                          <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700"
                            onClick={() => respondToRequest(request._id, "reject")}
                          >
                            <XCircleIcon className="h-4 w-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="section-frame p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-900">Chats</p>
                <span className="metric-pill">
                  <MailIcon className="h-4 w-4 text-brand" />
                  {threads.length}
                </span>
              </div>
              <div className="space-y-2">
                {threads.map((thread) => {
                  const active = String(thread.friend?._id) === String(selectedFriendId);
                  return (
                    <button
                      key={thread.friend?._id}
                      type="button"
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-brand bg-[#fff7ec] shadow-sm"
                          : "border-stone-200 bg-white/80 hover:border-brand/40"
                      }`}
                      onClick={() => setSelectedFriendId(thread.friend?._id || "")}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar user={thread.friend} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-semibold text-stone-900">{thread.friend?.name || "Member"}</p>
                            {thread.unreadCount > 0 && (
                              <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-stone-500">
                            {thread.lastMessage?.text || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {threads.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-5 text-center text-sm text-stone-600">
                    Accepted friends appear here.
                  </div>
                )}
              </div>
            </div>

            <div className="section-frame p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-900">Members</p>
                <span className="metric-pill">
                  <UsersIcon className="h-4 w-4 text-brand" />
                  {friendHub.people.length}
                </span>
              </div>
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {friendHub.people.map((person) => (
                  <div key={person._id} className="rounded-2xl border border-stone-200 bg-white/80 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={person} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-stone-900">{person.name}</p>
                        <p className="truncate text-xs text-stone-500">{person.hometown || person.email}</p>
                      </div>
                      {renderRelationshipAction(person)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="section-frame flex min-h-[620px] flex-col p-0">
            {selectedFriend ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={selectedFriend} size="h-12 w-12" />
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900">{selectedFriend.name}</h3>
                      <p className="text-sm text-stone-500">{selectedFriend.hometown || selectedFriend.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700"
                    onClick={() => removeFriend(selectedFriend._id)}
                  >
                    Remove friend
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {loadingThreadId === selectedFriendId && (
                    <div className="rounded-xl bg-white/75 px-4 py-3 text-sm text-stone-600">
                      Loading messages...
                    </div>
                  )}

                  {conversation.map((message) => {
                    const mine = String(message.sender?._id || message.sender) === String(user?._id);
                    return (
                      <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            mine
                              ? "bg-gradient-to-r from-brand to-brand2 text-white"
                              : "border border-stone-200 bg-white text-stone-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          <p className={`mt-1 text-[11px] ${mine ? "text-white/75" : "text-stone-400"}`}>
                            {message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {conversation.length === 0 && loadingThreadId !== selectedFriendId && (
                    <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-center text-stone-600">
                      Start the first message with {selectedFriend.name}.
                    </div>
                  )}
                </div>

                <form onSubmit={sendMessage} className="border-t border-stone-200/80 p-4">
                  <div className="flex gap-3">
                    <textarea
                      className="soft-input min-h-[54px]"
                      placeholder="Write a message"
                      value={messageDraft}
                      onChange={(e) => setMessageDraft(e.target.value)}
                    />
                    <button type="submit" className="primary-btn self-end" disabled={isSending || !messageDraft.trim()}>
                      {isSending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex h-full min-h-[620px] flex-col items-center justify-center p-8 text-center text-stone-600">
                <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-brand">
                  <UserIcon className="h-7 w-7" />
                </span>
                <h3 className="text-xl font-semibold text-stone-900">Choose a friend to chat</h3>
                <p className="mt-2 max-w-sm text-sm">
                  Send a friend request from the member list, then open the chat after it is accepted.
                </p>
                <span className="metric-pill mt-5">
                  <SparkIcon className="h-4 w-4 text-brand" />
                  Backend synced
                </span>
              </div>
            )}
          </main>
        </div>
      </section>
    </Layout>
  );
}

export default Messages;
