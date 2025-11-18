import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "../constants";
import { GripVertical, MessageSquare, X } from "lucide-react";

interface DraggableItemProps {
  name: string;
  onRemove: () => void;
  orSite?: string;
  isAssigned?: boolean;
  phoneDirectory?: Record<string, string>;
  isViewMode?: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  name,
  onRemove,
  orSite,
  isAssigned,
  phoneDirectory,
  isViewMode = false,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.STAFF,
    item: { name },
    canDrag: !isViewMode,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleNotify = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!orSite) return;

    const phone = phoneDirectory?.[name];
    
    if (!phone) {
      alert(`No phone number found for ${name}.\nPlease update the Phone Directory in the sidebar.`);
      return;
    }
    
    alert(`Sending SMS to ${name} (${phone}):\n"You are assigned to ${orSite}"`);
  };

  return (
    <div
      ref={isViewMode ? null : drag}
      className={`
        group flex items-center justify-between p-2 rounded-md shadow-sm border transition-all
        ${!isViewMode ? "cursor-grab active:cursor-grabbing" : "cursor-default"}
        ${isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"}
        ${isAssigned 
            ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
            : "bg-white border-slate-200 text-slate-700"
        }
        ${!isViewMode && !isAssigned && "hover:bg-slate-50 hover:border-blue-300"}
        ${!isViewMode && isAssigned && "hover:bg-emerald-100"}
      `}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {!isViewMode && <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        <span className={`truncate text-sm font-medium select-none ${isViewMode ? "pl-1" : ""}`} title={name}>
          {name}
        </span>
      </div>
      
      <div className={`flex items-center gap-1 ${isViewMode ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
        {orSite && (
          <button
            onClick={handleNotify}
            className="p-1 rounded-full hover:bg-blue-100 text-blue-500 transition-colors"
            title="Notify via SMS"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        )}
        {!isViewMode && (
          <button
            onClick={onRemove}
            className="p-1 rounded-full hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
            title="Remove assignment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};