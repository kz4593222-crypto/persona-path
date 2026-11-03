import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Reply, SendHorizontal, X, MessagesSquare, HelpCircle, CornerDownRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "@/components/dashboard/use-account";
import { MemberPhotoButton } from "@/components/dashboard/member-avatar";
import { formatMessageTime, useCommunityFeed, useCommunityLive, useMyThreads, useSendMessage, useToggleLike, type CommunityMessage, type Thread } from "@/components/dashboard/community-data";

type View = "chat" | "questions" | "replies";

export const Route = createFileRoute("/_authenticated/dashboard/community")({
  validateSearch: (search: Record<string, unknown>): { view: View } => ({
    view: search["view"] === "questions" || search["view"] === "replies" ? search["view"] : "chat",
  }),
  head: () => ({ meta: [
    { title: "Community — Ask and Answer Together" },
    { name: "description", content: "Group chat where members share problems, ask questions and reply to each other." },
    { property: "og:title", content: "Community — Ask and Answer Together" },
    { property: "og:description", content: "Ask questions and help other members." },
  ] }),
  component: CommunityTab,
});

const views: { id: View; label: string; icon: typeof MessagesSquare }[] = [
  { id: "chat", label: "Group chat", icon: MessagesSquare },
  { id: "questions", label: "Your questions", icon: HelpCircle },
  { id: "replies", label: "Your replies", icon: CornerDownRight },
];

function CommunityTab() {
  const { view } = Route.useSearch();
  const { data: account } = useAccount();
  const [replyTo, setReplyTo] = useState<CommunityMessage | null>(null);
  useCommunityLive();
  if (!account) return null;
  return <main className={`plan-page dash-page community-page community-${view}`}>
    <p className="plan-eyebrow">Members helping members</p>
    <h1 className="plan-title">Community</h1>
    {view === "chat" && <ChatFeed userId={account.userId} onReply={setReplyTo} />}
    {view !== "chat" && <MyThreads userId={account.userId} kind={view} />}
    <div className="community-dock">
      {view === "chat" && <Composer userId={account.userId} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />}
      <nav className="community-views" aria-label="Community views">
        {views.map(({ id, label, icon: Icon }) => <Link key={id} to="/dashboard/community" search={{ view: id }} className={view === id ? "is-active" : ""} aria-current={view === id ? "page" : undefined}><Icon aria-hidden="true" />{label}</Link>)}
      </nav>
    </div>
  </main>;
}

function LikeButton({ message, userId }: { message: CommunityMessage; userId: string }) {
  const toggle = useToggleLike();
  const liked = message.likes.some(like => like.user_id === userId);
  return <button type="button" className={`chat-action ${liked ? "is-liked" : ""}`} aria-pressed={liked} aria-label={liked ? "Remove like" : "Like"} disabled={toggle.isPending}
    onClick={() => toggle.mutate({ messageId: message.id, liked, userId }, { onError: () => toast.error("Could not update the like. Try again.") })}>
    <Heart aria-hidden="true" />{message.likes.length > 0 && <span>{message.likes.length}</span>}
  </button>;
}

function Quote({ message }: { message?: CommunityMessage }) {
  return <div className="chat-quote">
    <strong>{message?.author?.display_name ?? "Original message"}</strong>
    <span>{message ? message.body : "This message was removed."}</span>
  </div>;
}

function ChatFeed({ userId, onReply }: { userId: string; onReply: (message: CommunityMessage) => void }) {
  const feed = useCommunityFeed();
  const end = useRef<HTMLDivElement>(null);
  const count = feed.data?.messages.length ?? 0;
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [count]);

  if (feed.isPending) return <p className="community-status" role="status"><Loader2 className="plan-loading-spin" /> Loading messages…</p>;
  if (feed.isError) return <p className="community-status" role="alert">Messages could not be loaded. <Button variant="link" onClick={() => void feed.refetch()}>Try again</Button></p>;
  if (!count) return <div className="community-empty"><MessagesSquare aria-hidden="true" /><h2>Start the conversation</h2><p>Ask your first question — every member will see it and can reply.</p></div>;

  return <ol className="chat-list" aria-label="Group chat messages">
    {feed.data.messages.map(message => {
      const mine = message.user_id === userId;
      return <li key={message.id} className={`chat-row ${mine ? "is-mine" : ""}`}>
        {!mine && message.author && <MemberPhotoButton member={message.author} showName={false} size="sm" />}
        <div className="chat-bubble">
          {mine ? <span className="chat-author">You</span> : message.author && <MemberPhotoButton member={message.author} showName size="sm" />}
          {message.reply_to_id ? <Quote message={feed.data.quoted[message.reply_to_id]} /> : <span className="chat-tag">Question</span>}
          <p className="chat-body">{message.body}</p>
          <div className="chat-meta">
            <time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
            <LikeButton message={message} userId={userId} />
            <button type="button" className="chat-action" onClick={() => onReply(message)} aria-label={`Reply to ${message.author?.display_name ?? "message"}`}><Reply aria-hidden="true" />Reply</button>
          </div>
        </div>
      </li>;
    })}
    <div ref={end} />
  </ol>;
}

function Composer({ userId, replyTo, onClearReply }: { userId: string; replyTo: CommunityMessage | null; onClearReply: () => void }) {
  const [body, setBody] = useState("");
  const send = useSendMessage();
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (replyTo) field.current?.focus(); }, [replyTo]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || send.isPending) return;
    send.mutate({ body: text, replyToId: replyTo?.id ?? null, userId }, {
      onSuccess: () => { setBody(""); onClearReply(); },
      onError: () => toast.error("Your message was not sent. Try again."),
    });
  };
  return <form className="chat-composer" onSubmit={submit}>
    {replyTo && <div className="chat-replying"><Quote message={replyTo} /><button type="button" onClick={onClearReply} aria-label="Cancel reply"><X /></button></div>}
    <div className="chat-composer-row">
      <Textarea ref={field} value={body} onChange={event => setBody(event.target.value)} maxLength={1000} rows={1} placeholder={replyTo ? "Write your reply…" : "Ask a question or share a problem…"} aria-label="Message"
        onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(event); } }} />
      <Button type="submit" size="icon" className="chat-send" disabled={!body.trim() || send.isPending} aria-label="Send">{send.isPending ? <Loader2 className="plan-loading-spin" /> : <SendHorizontal />}</Button>
    </div>
  </form>;
}

function MyThreads({ userId, kind }: { userId: string; kind: "questions" | "replies" }) {
  const threads = useMyThreads(userId, kind);
  if (threads.isPending) return <p className="community-status" role="status"><Loader2 className="plan-loading-spin" /> Loading…</p>;
  if (threads.isError) return <p className="community-status" role="alert">Could not load. <Button variant="link" onClick={() => void threads.refetch()}>Try again</Button></p>;
  if (!threads.data.length) return <div className="community-empty">
    {kind === "questions" ? <HelpCircle aria-hidden="true" /> : <CornerDownRight aria-hidden="true" />}
    <h2>{kind === "questions" ? "No questions yet" : "No replies yet"}</h2>
    <p>{kind === "questions" ? "Questions you ask in the group chat and their replies appear here." : "When you answer someone in the group chat, you'll see how people responded here."}</p>
    <Button variant="next" asChild><Link to="/dashboard/community" search={{ view: "chat" }}>Open group chat</Link></Button>
  </div>;
  return <ul className="thread-list">{threads.data.map(thread => <ThreadCard key={thread.message.id} thread={thread} kind={kind} userId={userId} />)}</ul>;
}

function ThreadCard({ thread, kind, userId }: { thread: Thread; kind: "questions" | "replies"; userId: string }) {
  const { message, original, responses } = thread;
  return <li className="thread-card">
    {kind === "replies" && <div className="thread-original"><span>You replied to</span><Quote message={original} /></div>}
    <p className="thread-mine">{message.body}</p>
    <div className="chat-meta">
      <time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
      <span className="thread-likes"><Heart aria-hidden="true" />{message.likes.length} {message.likes.length === 1 ? "like" : "likes"}</span>
      <span>{responses.length} {responses.length === 1 ? "reply" : "replies"}</span>
    </div>
    {responses.length > 0 && <ul className="thread-responses">
      {responses.map(response => <li key={response.id}>
        {response.author && <MemberPhotoButton member={response.author} size="sm" />}
        <p>{response.body}</p>
        <div className="chat-meta"><time dateTime={response.created_at}>{formatMessageTime(response.created_at)}</time><LikeButton message={response} userId={userId} /></div>
      </li>)}
    </ul>}
  </li>;
}
