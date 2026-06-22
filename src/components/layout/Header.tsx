import { APP_NAME } from "@/lib/constants";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface HeaderProps {
  userName?: string | null;
  userAvatar?: string | null;
}

export function Header({ userName, userAvatar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
          BW
        </div>
        <span className="font-bold text-slate-900">{APP_NAME}</span>
      </div>
      <div className="flex items-center gap-2">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}
