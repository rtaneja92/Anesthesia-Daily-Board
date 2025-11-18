import React from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../constants";
import { DraggableItem } from "./DraggableItem";
import { DragItem } from "../types";

interface DropZoneProps {
  rowIndex: number;
  columnKey: string;
  currentName?: string;
  orSite: string;
  onDrop: (item: DragItem, rowIndex: number, columnKey: string) => void;
  onRemove: () => void;
  phoneDirectory: Record<string, string>;
  isViewMode?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  rowIndex,
  columnKey,
  currentName,
  orSite,
  onDrop,
  onRemove,
  phoneDirectory,
  isViewMode = false,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.STAFF,
    canDrop: () => !isViewMode,
    drop: (item: DragItem) => {
      onDrop(item, rowIndex, columnKey);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={`
        relative min-h-[3.5rem] rounded-md transition-colors duration-200 p-1 border
        ${isActive ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200 ring-opacity-50" : "border-transparent"}
        ${!currentName && !isActive && !isViewMode ? "bg-slate-50 hover:bg-slate-100 border-dashed border-slate-200" : ""}
        ${!currentName && isViewMode ? "bg-transparent" : ""}
      `}
    >
      {currentName ? (
        <DraggableItem
          name={currentName}
          orSite={orSite}
          onRemove={onRemove}
          isAssigned={true}
          phoneDirectory={phoneDirectory}
          isViewMode={isViewMode}
        />
      ) : (
        !isViewMode && (
          <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs select-none pointer-events-none">
            Empty
          </div>
        )
      )}
    </div>
  );
};