import { User } from "../types";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import muniHeader from '../public/muni-header.webp'; // <- AÑADIDO

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ currentUser, onLogout, onMenuClick, showMenuButton = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-3"> {/* <- RESTAURADO */}
            <img
              src={muniHeader}
              alt="Municipalidad de Villa Mercedes"
              className="h-10 md:h-12 object-contain"
            />
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm md:text-base text-gray-900">
                  {currentUser.nombre} {currentUser.apellido}
                </p>
                <p className="text-xs md:text-sm text-gray-500 capitalize">
                  {currentUser.role}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-xs md:text-sm"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Salir</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}