import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { initials, type MemberCard } from '@/lib/account';
import { useAvatarSrc } from './use-account';

export function AvatarCircle({ member, size = 'md' }: { member: Pick<MemberCard, 'display_name' | 'avatar_path' | 'avatar_url'>; size?: 'sm' | 'md' | 'lg' }) {
  const src = useAvatarSrc(member);
  return <span className={`member-avatar member-avatar-${size}`}>
    {src ? <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span>{initials(member.display_name)}</span>}
  </span>;
}

/** Name + photo that open only the enlarged photo when tapped. */
export function MemberPhotoButton({ member, showName = true, size = 'md' }: { member: MemberCard; showName?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = useState(false);
  const src = useAvatarSrc(member);
  return <>
    <button type="button" className="member-photo-button" onClick={() => setOpen(true)} aria-label={`View ${member.display_name}'s photo`}>
      <AvatarCircle member={member} size={size} />
      {showName && <span className="member-name">{member.display_name}</span>}
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="member-photo-dialog">
        <DialogTitle className="sr-only">{member.display_name}'s photo</DialogTitle>
        {src ? <img src={src} alt={`${member.display_name}'s profile photo`} className="member-photo-large" referrerPolicy="no-referrer" /> : <span className="member-photo-placeholder">{initials(member.display_name)}</span>}
      </DialogContent>
    </Dialog>
  </>;
}
