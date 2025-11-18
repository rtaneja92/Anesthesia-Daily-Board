import React, { useState, useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  OR_SITES,
  SITE_SECTIONS,
  COLUMNS,
  PHONE_NUMBERS,
} from "./constants";
import { BoardData, BreakData, DragItem } from "./types";
import { DropZone } from "./components/DropZone";
import { StaffInput } from "./components/StaffInput";
import { Check, Coffee, AlertTriangle, X, Eye, Lock, LayoutDashboard } from "lucide-react";

export default function App() {
  const [boardData, setBoardData] = useState<BoardData>({});
  const [breaks, setBreaks] = useState<BreakData>({});
  
  // Separate state for draggable lists
  const [anesthOptions, setAnesthOptions] = useState<string[]>([]);
  const [ahpOptions, setAhpOptions] = useState<string[]>([]);
  const [reliefOptions, setReliefOptions] = useState<string[]>([]);

  // State for phone directory - initialize from localStorage if available
  const [phoneDirectory, setPhoneDirectory] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('anesthesia_board_phones');
    return saved ? JSON.parse(saved) : PHONE_NUMBERS;
  });

  // View Mode State
  const [isViewMode, setIsViewMode] = useState(false);

  // Clear Board / Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'CLEAR' | 'UNLOCK' | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Save phone directory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('anesthesia_board_phones', JSON.stringify(phoneDirectory));
  }, [phoneDirectory]);

  const formattedDate = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Helper to find assigned names for styling
  const getAssignedNames = useCallback(() => {
    const assigned = new Set<string>();
    Object.values(boardData).forEach((row) => {
      Object.values(row).forEach((name) => {
        if (name) assigned.add(name);
      });
    });
    return assigned;
  }, [boardData]);

  const handleDrop = useCallback((item: DragItem, targetRowIndex: number, targetColumnKey: string) => {
    setBoardData((prev) => {
      const newData: BoardData = {};
      
      // Deep copy and remove item from previous location if it exists on board
      Object.keys(prev).forEach((key) => {
        const rowIndex = Number(key);
        newData[rowIndex] = { ...prev[rowIndex] };
        COLUMNS.forEach((col) => {
          if (newData[rowIndex][col] === item.name) {
            delete newData[rowIndex][col];
          }
        });
      });

      // Ensure target row exists
      if (!newData[targetRowIndex]) {
        newData[targetRowIndex] = {};
      }

      // If target cell is occupied, we could swap, but for now we overwrite (or push out)
      // The simple requirement is to place it.
      newData[targetRowIndex][targetColumnKey] = item.name;

      return newData;
    });
  }, []);

  const handleRemove = useCallback((rowIndex: number, columnKey: string) => {
    setBoardData((prev) => {
      const newData = { ...prev };
      if (newData[rowIndex]) {
        newData[rowIndex] = { ...newData[rowIndex] }; // Copy row
        delete newData[rowIndex][columnKey];
      }
      return newData;
    });
  }, []);

  const toggleBreak = (rowIndex: number, breakIndex: 0 | 1) => {
    setBreaks((prev) => {
      const newBreaks = { ...prev };
      if (!newBreaks[rowIndex]) newBreaks[rowIndex] = [false, false];
      
      const currentBreaks = [...newBreaks[rowIndex]] as [boolean, boolean];
      currentBreaks[breakIndex] = !currentBreaks[breakIndex];
      
      newBreaks[rowIndex] = currentBreaks;
      return newBreaks;
    });
  };

  const handleExport = () => {
    const tableData = OR_SITES.map((site, index) => {
      const row = boardData[index] || {};
      return {
        OR: site,
        Anesthesiologist: row["Anesthesiologist"] || "",
        AHP: row["AHP"] || "",
        Relief: row["Relief"] || "",
        Break1: breaks[index]?.[0] ? "Yes" : "No",
        Break2: breaks[index]?.[1] ? "Yes" : "No",
      };
    });

    const csvHeader = ["OR", "Anesthesiologist", "AHP", "Relief", "Break 1", "Break 2"];
    const csvRows = [
      csvHeader.join(","),
      ...tableData.map((row) =>
        [row.OR, row.Anesthesiologist, row.AHP, row.Relief, row.Break1, row.Break2]
          .map((cell) => `"${cell}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `OR_Schedule_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenClearModal = useCallback(() => {
    setAuthAction('CLEAR');
    setIsAuthModalOpen(true);
    setPasswordInput("");
    setPasswordError("");
  }, []);

  const handleUnlockAdminRequest = useCallback(() => {
    setAuthAction('UNLOCK');
    setIsAuthModalOpen(true);
    setPasswordInput("");
    setPasswordError("");
  }, []);

  const handleConfirmPassword = () => {
    if (passwordInput === "admin") {
      if (authAction === 'CLEAR') {
          setBoardData({});
          setBreaks({});
          setAnesthOptions([]);
          setAhpOptions([]);
          setReliefOptions([]);
      } else if (authAction === 'UNLOCK') {
          setIsViewMode(false);
      }
      
      setIsAuthModalOpen(false);
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
        {/* Main Board Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <header className={`bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10 ${isViewMode ? "bg-slate-50" : ""}`}>
             <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  {isViewMode ? <LayoutDashboard className="text-blue-600" /> : null}
                  Anesthesia Daily Board 
                  <span className="text-slate-500 font-normal text-lg">{formattedDate}</span>
                  {isViewMode && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide">View Only</span>}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {isViewMode 
                    ? "Read-only view. Breaks can be updated."
                    : "Drag staff to assign to ORs. Toggle breaks as needed."}
                </p>
             </div>
             <div>
               {isViewMode ? (
                 <button 
                    onClick={handleUnlockAdminRequest}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition-colors text-sm font-medium"
                 >
                   <Lock className="w-4 h-4" /> Unlock Admin Mode
                 </button>
               ) : (
                 <button 
                    onClick={() => setIsViewMode(true)}
                    className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                 >
                   <Eye className="w-4 h-4" /> Switch to View Mode
                 </button>
               )}
             </div>
          </header>

          {/* Sticky Table Header */}
          <div className="flex-1 overflow-auto px-8 py-6 custom-scrollbar">
             <div className={`min-w-[800px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${isViewMode ? "shadow-md" : ""}`}>
                <div className="grid grid-cols-[120px_1fr_1fr_1fr_100px] gap-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-sm sticky top-0 z-10 shadow-sm">
                  <div className="p-4 border-r border-slate-200">OR / Site</div>
                  {COLUMNS.map((col) => (
                    <div key={col} className="p-4 border-r border-slate-200">{col}</div>
                  ))}
                  <div className="p-4 text-center">Breaks</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100">
                    {SITE_SECTIONS.map((section) => (
                      <React.Fragment key={section.title}>
                        {/* Section Header */}
                        <div className="bg-slate-100/80 backdrop-blur-sm px-4 py-2 border-y border-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wider">
                          {section.title}
                        </div>
                        
                        {/* Section Rows */}
                        {section.sites.map((site) => {
                          // Determine global index for boardData mapping
                          const globalIndex = OR_SITES.indexOf(site);
                          
                          return (
                            <div
                                key={site}
                                className="grid grid-cols-[120px_1fr_1fr_1fr_100px] gap-0 items-stretch hover:bg-slate-50 transition-colors bg-white"
                            >
                                <div className="p-3 font-semibold text-slate-700 flex items-center justify-center border-r border-slate-100">
                                   <span className={`
                                     px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center
                                     ${isViewMode ? "bg-slate-800 text-white" : "bg-slate-100 border border-slate-200 text-slate-600"}
                                   `}>
                                     {site}
                                   </span>
                                </div>
                                {COLUMNS.map((col) => (
                                <div key={col} className="p-2 border-r border-slate-100">
                                    <DropZone
                                        rowIndex={globalIndex}
                                        columnKey={col}
                                        currentName={boardData[globalIndex]?.[col]}
                                        orSite={site}
                                        onDrop={handleDrop}
                                        onRemove={() => handleRemove(globalIndex, col)}
                                        phoneDirectory={phoneDirectory}
                                        isViewMode={isViewMode}
                                    />
                                </div>
                                ))}
                                <div className="p-3 flex items-center justify-center gap-3">
                                    {[0, 1].map((breakIndex) => (
                                        <button
                                            key={breakIndex}
                                            onClick={() => toggleBreak(globalIndex, breakIndex as 0 | 1)}
                                            className={`
                                                w-8 h-8 rounded-full flex items-center justify-center border transition-all
                                                ${breaks[globalIndex]?.[breakIndex] 
                                                    ? "bg-emerald-500 border-emerald-600 text-white shadow-sm" 
                                                    : "bg-white border-slate-300 text-slate-300 hover:border-slate-400 hover:text-slate-400"
                                                }
                                            `}
                                            title={`Toggle Break ${breakIndex + 1}`}
                                        >
                                            {breaks[globalIndex]?.[breakIndex] ? <Check className="w-4 h-4" strokeWidth={3} /> : <Coffee className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                </div>
             </div>
             <div className="h-20"></div> {/* Bottom spacer */}
          </div>
        </div>

        {/* Sidebar for inputs - Only show in Admin Mode */}
        {!isViewMode && (
          <StaffInput
            assignedNames={getAssignedNames()}
            anesthOptions={anesthOptions}
            setAnesthOptions={setAnesthOptions}
            ahpOptions={ahpOptions}
            setAhpOptions={setAhpOptions}
            reliefOptions={reliefOptions}
            setReliefOptions={setReliefOptions}
            onExport={handleExport}
            phoneDirectory={phoneDirectory}
            setPhoneDirectory={setPhoneDirectory}
            onClearBoard={handleOpenClearModal}
          />
        )}

        {/* Custom Modal for Auth (Clear Board or Unlock Admin) */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {authAction === 'CLEAR' ? <AlertTriangle className="text-red-500 w-5 h-5" /> : <Lock className="text-blue-600 w-5 h-5" />}
                  {authAction === 'CLEAR' ? "Clear Daily Board" : "Unlock Admin Mode"}
                </h3>
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-slate-600 text-sm mb-4">
                {authAction === 'CLEAR' 
                    ? "This will remove all staff assignments, break records, and clear the loaded staff lists."
                    : "Enter password to enable editing and return to Admin Mode."}
              </p>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">Admin Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirmPassword()}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 outline-none ${authAction === 'CLEAR' ? "border-slate-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"}`}
                  autoFocus
                  placeholder="Enter password..."
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPassword}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${authAction === 'CLEAR' ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {authAction === 'CLEAR' ? "Confirm Clear" : "Unlock"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}