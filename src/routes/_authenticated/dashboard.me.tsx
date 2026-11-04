import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, CalendarDays, Flame, Loader2, LogOut, Pencil, RotateCcw, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/dashboard/use-account";
import { MemberPhotoButton } from "@/components/dashboard/member-avatar";
import { usePlanProgress } from "@/components/use-plan-progress";
import { currentPlanDay, daysSinceStart, nextNameChange, validDisplayName, NAME_LOCK_DAYS } from "@/lib/account";
import { goals } from "@/lib/goals";
import { questions } from "@/lib/questionnaire";
import { bmi } from "@/lib/recovery";

export const Route = createFileRoute("/_authenticated/dashboard/me")({
  head: () => ({ meta: [
    { title: "Me — Profile and Progress" },
    { name: "description", content: "Your name, photo, body details and how long you've been on your plan." },
    { property: "og:title", content: "Me — Profile and Progress" },
    { property: "og:description", content: "Your profile and plan progress." },
  ] }),
  component: MeTab,
});

const dateFormat: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function optionLabel(id: string, value: unknown) {
  const question = questions.find(item => item.id === id);
  const values = Array.isArray(value) ? value : [value];
  return values.map(item => question?.options?.find(option => option.id === item)?.label ?? String(item)).join(", ");
}

function MeTab() {
  const { data: account } = useAccount();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fitness = account?.fitness;
  const progress = usePlanProgress(fitness ? `${fitness.gender}:${fitness.goal}` : "male:abs");
  if (!account || !fitness) return null;

  const { profile } = account;
  const lockedUntil = nextNameChange(profile.name_changed_at);
  const answers = fitness.answers;
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["account"] }), queryClient.invalidateQueries({ queryKey: ["community"] })]);

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    if (!validDisplayName(name)) return toast.error("Your name needs 2 to 40 characters.");
    if (name.trim() === profile.display_name) return setEditing(false);
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", account.userId);
    setSavingName(false);
    if (error) return toast.error(error.message.includes("NAME_LOCKED") ? `You can change your name once every ${NAME_LOCK_DAYS} days.` : "Your name was not saved. Try again.");
    setEditing(false);
    toast.success("Name updated");
    await refresh();
  };

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return toast.error("Please choose a JPG, PNG or WebP photo.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Please choose a photo under 5 MB.");
    setUploading(true);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${account.userId}/photo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
    if (uploadError) { setUploading(false); return toast.error("Your photo was not uploaded. Try again."); }
    const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", account.userId);
    if (error) { setUploading(false); await supabase.storage.from("avatars").remove([path]); return toast.error("Your photo was not saved. Try again."); }
    if (profile.avatar_path) void supabase.storage.from("avatars").remove([profile.avatar_path]);
    setUploading(false);
    toast.success("Photo updated");
    await refresh();
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  const since = daysSinceStart(fitness.plan_started_at);
  const details = [
    { label: "Gender", value: fitness.gender === "female" ? "Female" : "Male" },
    { label: "Age", value: `${answers["age"]} years` },
    { label: "Height", value: `${answers["height"]} cm` },
    { label: "Weight", value: `${answers["weight"]} kg` },
    { label: "BMI", value: String(bmi(answers)) },
    { label: "Goal", value: goals.find(goal => goal.id === fitness.goal)?.label ?? "" },
    { label: "Fitness level", value: optionLabel("fitness", answers["fitness"]) },
    { label: "Daily activity", value: optionLabel("activity", answers["activity"]) },
    { label: "Sleep", value: optionLabel("sleep", answers["sleep"]) },
    { label: "Workout time", value: optionLabel("time", answers["time"]) },
    { label: "Workout space", value: optionLabel("equipment", answers["equipment"]) },
    { label: "Health", value: optionLabel("health", answers["health"]) },
  ];

  return <main className="plan-page dash-page me-page">
    <section className="me-card" aria-label="Your profile">
      <div className="me-photo">
        <MemberPhotoButton member={profile} showName={false} size="lg" />
        <button type="button" className="me-photo-edit" onClick={() => fileInput.current?.click()} disabled={uploading} aria-label="Upload a new photo">
          {uploading ? <Loader2 className="plan-loading-spin" /> : <Camera />}
        </button>
        <input ref={fileInput} type="file" accept={PHOTO_TYPES.join(",")} className="sr-only" onChange={uploadPhoto} aria-label="Profile photo" />
      </div>
      {editing ? <form className="me-name-form" onSubmit={saveName}>
        <Input value={name} onChange={event => setName(event.target.value)} maxLength={40} aria-label="Your name" autoFocus />
        <p className="me-hint">After saving, you can't change your name again for {NAME_LOCK_DAYS} days.</p>
        <div className="me-name-actions">
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          <Button type="submit" variant="next" disabled={savingName}>{savingName && <Loader2 className="plan-loading-spin" />}Save name</Button>
        </div>
      </form> : <>
        <h1 className="me-name">{profile.display_name}</h1>
        {account.email && <p className="me-email">{account.email}</p>}
        {lockedUntil
          ? <p className="me-hint"><Lock aria-hidden="true" />You can change your name again on {lockedUntil.toLocaleDateString([], dateFormat)}</p>
          : <Button variant="outline" className="me-edit" onClick={() => { setName(profile.display_name); setEditing(true); }}><Pencil />Change name</Button>}
      </>}
    </section>

    <section className="me-streak" aria-label="Plan progress">
      <div><CalendarDays aria-hidden="true" /><span>Started on</span><strong>{new Date(fitness.plan_started_at).toLocaleDateString([], dateFormat)}</strong></div>
      <div><Flame aria-hidden="true" /><span>Working out for</span><strong>{since === 0 ? "Started today" : `${since} ${since === 1 ? "day" : "days"}`}</strong></div>
      <p>Today is Day {currentPlanDay(fitness.plan_started_at)} of 30 · {progress.days.length} {progress.days.length === 1 ? "day" : "days"} completed</p>
    </section>

    <section className="dash-section" aria-labelledby="details-title">
      <h2 id="details-title">My details</h2>
      <dl className="me-details">{details.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
    </section>

    <div className="me-actions">
      <Button variant="outline" asChild><Link to="/"><RotateCcw />Update my answers</Link></Button>
      <Button variant="ghost" onClick={() => void signOut()}><LogOut />Sign out</Button>
    </div>
  </main>;
}
