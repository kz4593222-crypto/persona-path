import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, CalendarDays, Camera, CheckCircle2, ChevronRight, Clock, Dumbbell, Flame, HeartPulse, Home, Loader2, Lock, LogOut, Moon, Pencil, Ruler, RotateCcw, Scale, Target, UserRound, Cake, Gauge } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/dashboard/use-account";
import { MemberPhotoButton } from "@/components/dashboard/member-avatar";
import { AvatarCropDialog } from "@/components/dashboard/avatar-crop-dialog";
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
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fitness = account?.fitness;
  const progress = usePlanProgress(fitness ? `${fitness.gender}:${fitness.goal}` : "male:abs");
  useEffect(() => () => { if (cropSrc) URL.revokeObjectURL(cropSrc); }, [cropSrc]);
  if (!account || !fitness) return null;

  const { profile } = account;
  const lockedUntil = nextNameChange(profile.name_changed_at);
  const answers = fitness.answers;
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["account"] }), queryClient.invalidateQueries({ queryKey: ["community"] })]);

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    if (!validDisplayName(name)) { toast.error("Your name needs 2 to 40 characters."); return; }
    if (name.trim() === profile.display_name) { setEditing(false); return; }
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", account.userId);
    setSavingName(false);
    if (error) { toast.error(error.message.includes("NAME_LOCKED") ? `You can change your name once every ${NAME_LOCK_DAYS} days.` : "Your name was not saved. Try again."); return; }
    setEditing(false);
    toast.success("Name updated");
    await refresh();
  };

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) { toast.error("Please choose a JPG, PNG or WebP photo."); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error("Please choose a photo under 15 MB."); return; }
    setCropSrc(URL.createObjectURL(file));
  };

  const savePhoto = async (blob: Blob) => {
    const path = `${account.userId}/photo-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;
    const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", account.userId);
    if (error) { await supabase.storage.from("avatars").remove([path]); throw error; }
    if (profile.avatar_path) void supabase.storage.from("avatars").remove([profile.avatar_path]);
    setCropSrc(null);
    toast.success("Profile photo updated");
    await refresh();
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  const since = daysSinceStart(fitness.plan_started_at);
  const today = currentPlanDay(fitness.plan_started_at);
  const done = progress.days.length;
  const body = [
    { label: "Gender", value: fitness.gender === "female" ? "Female" : "Male", icon: UserRound },
    { label: "Age", value: `${answers["age"]} years`, icon: Cake },
    { label: "Height", value: `${answers["height"]} cm`, icon: Ruler },
    { label: "Weight", value: `${answers["weight"]} kg`, icon: Scale },
    { label: "BMI", value: String(bmi(answers)), icon: Gauge },
  ];
  const training = [
    { label: "Goal", value: goals.find(goal => goal.id === fitness.goal)?.label ?? "", icon: Target },
    { label: "Fitness level", value: optionLabel("fitness", answers["fitness"]), icon: Dumbbell },
    { label: "Daily activity", value: optionLabel("activity", answers["activity"]), icon: Activity },
    { label: "Sleep", value: optionLabel("sleep", answers["sleep"]), icon: Moon },
    { label: "Workout time", value: optionLabel("time", answers["time"]), icon: Clock },
    { label: "Workout space", value: optionLabel("equipment", answers["equipment"]), icon: Home },
    { label: "Health", value: optionLabel("health", answers["health"]), icon: HeartPulse },
  ];

  return <main className="plan-page dash-page me-page">
    <header className="dash-header">
      <p className="plan-eyebrow">Your profile</p>
      <h1 className="plan-title">Me</h1>
    </header>

    <section className="me-card" aria-label="Your profile">
      <div className="me-photo">
        <MemberPhotoButton member={profile} showName={false} size="lg" />
        <button type="button" className="me-photo-edit" onClick={() => fileInput.current?.click()} aria-label="Change profile photo">
          <Camera aria-hidden="true" />
        </button>
        <input ref={fileInput} type="file" accept={PHOTO_TYPES.join(",")} className="sr-only" onChange={choosePhoto} aria-label="Profile photo" />
      </div>
      {editing ? <form className="me-name-form" onSubmit={saveName}>
        <Input value={name} onChange={event => setName(event.target.value)} maxLength={40} aria-label="Your name" autoFocus />
        <p className="me-hint">After saving, you can't change your name again for {NAME_LOCK_DAYS} days.</p>
        <div className="me-name-actions">
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          <Button type="submit" className="me-save" disabled={savingName}>{savingName && <Loader2 className="plan-loading-spin" />}Save name</Button>
        </div>
      </form> : <>
        <h2 className="me-name">{profile.display_name}</h2>
        {account.email && <p className="me-email">{account.email}</p>}
        {lockedUntil
          ? <p className="me-hint"><Lock aria-hidden="true" />Name can change again on {lockedUntil.toLocaleDateString([], dateFormat)}</p>
          : <button type="button" className="me-edit" onClick={() => { setName(profile.display_name); setEditing(true); }}><Pencil aria-hidden="true" />Change name</button>}
      </>}
    </section>

    <section className="me-stats" aria-label="Plan progress">
      <div className="me-stat me-stat-day"><span className="me-stat-icon"><CalendarDays aria-hidden="true" /></span><strong>{today}<small>/30</small></strong><span>Today</span></div>
      <div className="me-stat me-stat-done"><span className="me-stat-icon"><CheckCircle2 aria-hidden="true" /></span><strong>{done}</strong><span>Completed</span></div>
      <div className="me-stat me-stat-streak"><span className="me-stat-icon"><Flame aria-hidden="true" /></span><strong>{since}</strong><span>{since === 1 ? "Day active" : "Days active"}</span></div>
    </section>

    <section className="me-progress" aria-label="Plan completion">
      <div className="me-progress-head"><strong>Plan progress</strong><span>{Math.round(done / 30 * 100)}%</span></div>
      <progress max={30} value={done} aria-label={`${done} of 30 days completed`} />
      <p>Started on {new Date(fitness.plan_started_at).toLocaleDateString([], dateFormat)}</p>
    </section>

    <section className="dash-section" aria-labelledby="body-title">
      <h2 id="body-title">Body</h2>
      <DetailList items={body} />
    </section>

    <section className="dash-section" aria-labelledby="training-title">
      <h2 id="training-title">Training</h2>
      <DetailList items={training} />
    </section>

    <nav className="me-actions" aria-label="Account">
      <Link to="/" className="me-action"><span className="me-row-icon"><RotateCcw aria-hidden="true" /></span>Update my answers<ChevronRight aria-hidden="true" className="me-action-arrow" /></Link>
      <button type="button" className="me-action me-action-danger" onClick={() => void signOut()}><span className="me-row-icon"><LogOut aria-hidden="true" /></span>Sign out<ChevronRight aria-hidden="true" className="me-action-arrow" /></button>
    </nav>

    <AvatarCropDialog src={cropSrc} onCancel={() => setCropSrc(null)} onSave={savePhoto} />
  </main>;
}

function DetailList({ items }: { items: { label: string; value: string; icon: typeof UserRound }[] }) {
  return <dl className="me-list">{items.map(({ label, value, icon: Icon }) => <div key={label}>
    <dt><span className="me-row-icon"><Icon aria-hidden="true" /></span>{label}</dt>
    <dd>{value}</dd>
  </div>)}</dl>;
}
