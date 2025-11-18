
import React, { useState } from "react";
import { StaffCategory, CATEGORIES } from "../types";
import { DraggableItem } from "./DraggableItem";
import { Plus, Download, Trash2, Users, Phone, AlertTriangle } from "lucide-react";

interface StaffInputProps {
  assignedNames: Set<string>;
  anesthOptions: string[];
  setAnesthOptions: React.Dispatch<React.SetStateAction<string[]>>;
  ahpOptions: string[];
  setAhpOptions: React.Dispatch<React.SetStateAction<string[]>>;
  reliefOptions: string[];
  setReliefOptions: React.Dispatch<React.SetStateAction<string[]>>;
  onExport: () => void;
  phoneDirectory: Record<string, string>;
  setPhoneDirectory: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onClearBoard: () => void;
}

export const StaffInput: React.FC<StaffInputProps> = ({
  assignedNames,
  anesthOptions,
  setAnesthOptions,
  ahpOptions,
  setAhpOptions,
  reliefOptions,
  setReliefOptions,
  onExport,
  phoneDirectory,
  setPhoneDirectory,
  onClearBoard,
}) => {
  const [viewMode, setViewMode] = useState<'staff' | 'phones'>('staff');
  const [inputList, setInputList] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<StaffCategory>("Anesthesiologist");
  const [phoneInput, setPhoneInput] = useState("");

  const handlePasteStaff = () => {
    const lines = inputList
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const filterNew = (currentList: string[]) => {
      const currentSet = new Set(currentList);
      return lines.filter(name => !currentSet.has(name));
    }

    if (selectedCategory === "Anesthesiologist") {
      setAnesthOptions((prev) => [...prev, ...filterNew(prev)]);
    } else if (selectedCategory === "AHP") {
      setAhpOptions((prev) => [...prev, ...filterNew(prev)]);
    } else {
      setReliefOptions((prev) => [...prev, ...filterNew(prev)]);
    }
    setInputList("");
  };

  const handleImportPhones = () => {
    const lines = phoneInput.split('\n').map(line => line.trim()).filter(Boolean);
    const newEntries: Record<string, string> = {};
    let addedCount = 0;

    lines.forEach(line => {
        // Try split by comma first, then colon
        let parts = line.split(',');
        if (parts.length < 2) parts = line.split(':');
        
        if (parts.length >= 2) {
            const name = parts[0].trim();
            const phone = parts.slice(1).join('').trim(); // Join rest in case of extra commas
            if (name && phone) {
                newEntries[name] = phone;
                addedCount++;
            }
        }
    });

    if (addedCount > 0) {
        setPhoneDirectory(prev => ({ ...prev, ...newEntries }));
        setPhoneInput("");
        alert(`Successfully imported ${addedCount} phone numbers.`);
    } else {
        alert("Could not parse any phone numbers. Please use 'Name, Phone' format.");
    }
  };

  const clearCategory = (category: StaffCategory) => {
    if (confirm(`Are you sure you want to clear all ${category}s? Assignments will remain.`)) {
        if (category === "Anesthesiologist") setAnesthOptions([]);
        else if (category === "AHP") setAhpOptions([]);
        else setReliefOptions([]);
    }
  }

  const renderStaffList = (title: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, category: StaffCategory) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
            {title} <span className="bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">{list.length}</span>
        </h3>
        <button onClick={() => clearCategory(category)} className="text-slate-400 hover:text-red-500 transition-colors" title="Clear list">
            <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {list.length === 0 && (
            <div className="text-slate-400 text-xs italic p-2 text-center border border-dashed border-slate-200 rounded">No staff available</div>
        )}
        {list.map((name) => (
          <DraggableItem
            key={`${category}-${name}`}
            name={name}
            onRemove={() => setter((prev) => prev.filter((n) => n !== name))}
            isAssigned={assignedNames.has(name)}
            phoneDirectory={phoneDirectory}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white border-l border-slate-200 h-screen flex flex-col w-80 shadow-xl z-20">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
          <button 
            onClick={() => setViewMode('staff')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${viewMode === 'staff' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" /> Staff
          </button>
          <button 
            onClick={() => setViewMode('phones')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${viewMode === 'phones' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Phone className="w-4 h-4" /> Directory
          </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {viewMode === 'staff' ? (
            <>
                <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-medium text-slate-600 mb-1">Add Staff Names</label>
                <textarea
                    rows={3}
                    value={inputList}
                    onChange={(e) => setInputList(e.target.value)}
                    placeholder="Paste names here (one per line)..."
                    className="w-full border border-slate-300 px-3 py-2 rounded-md text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
                <div className="flex gap-2">
                    <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as StaffCategory)}
                    className="flex-1 border border-slate-300 px-2 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                        {cat}
                        </option>
                    ))}
                    </select>
                    <button
                    onClick={handlePasteStaff}
                    disabled={!inputList.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                    >
                    <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
                </div>

                {renderStaffList("Anesthesiologists", anesthOptions, setAnesthOptions, "Anesthesiologist")}
                {renderStaffList("AHPs", ahpOptions, setAhpOptions, "AHP")}
                {renderStaffList("Relief", reliefOptions, setReliefOptions, "Relief")}
            </>
        ) : (
            <>
                <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Import Phone Numbers</h3>
                    <p className="text-xs text-slate-500 mb-2">
                        Paste a list of names and phone numbers separated by commas.
                        <br/>Example: <code>Dr. Smith, 555-123-4567</code>
                    </p>
                    <textarea
                        rows={6}
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Dr. Name, 555-000-0000&#10;Jane Doe, 555-111-1111"
                        className="w-full border border-slate-300 px-3 py-2 rounded-md text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                    <button
                        onClick={handleImportPhones}
                        disabled={!phoneInput.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                        <Download className="w-4 h-4" /> Import Numbers
                    </button>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                            Current Directory
                        </h3>
                        <span className="bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">
                            {Object.keys(phoneDirectory).length}
                        </span>
                    </div>
                    <div className="border rounded-md divide-y divide-slate-100 bg-white">
                        {Object.entries(phoneDirectory).length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs italic">Directory is empty</div>
                        ) : (
                            Object.entries(phoneDirectory).map(([name, phone]) => (
                                <div key={name} className="px-3 py-2 text-sm flex justify-between items-center hover:bg-slate-50">
                                    <span className="font-medium text-slate-700 truncate pr-2" title={name}>{name}</span>
                                    <span className="text-slate-500 font-mono text-xs whitespace-nowrap">{phone}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
        <button
          onClick={onExport}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        
        <button
          onClick={onClearBoard}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
          title="Requires Admin Password"
        >
          <AlertTriangle className="w-4 h-4" /> Clear Daily Board
        </button>
      </div>
    </div>
  );
};
