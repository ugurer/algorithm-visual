"use client";

import { Editor } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface DebugVariable {
  name: string;
  value: any;
  previousValue?: any;
  type: string;
}

interface DebugPanelProps {
  code: string;
  onCodeChange: (value: string) => void;
  onRun: () => void;
  onStop: () => void;
  isRunning: boolean;
  variables: DebugVariable[];
  className?: string;
}

export function DebugPanel({
  code,
  onCodeChange,
  onRun,
  onStop,
  isRunning,
  variables,
  className,
}: DebugPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4 p-4 bg-background rounded-lg border", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Debug Paneli</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRun}
            disabled={isRunning}
          >
            <Play className="w-4 h-4 mr-2" />
            Çalıştır
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            disabled={!isRunning}
          >
            <Square className="w-4 h-4 mr-2" />
            Durdur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Kod</h4>
          <div className="h-[400px] border rounded-md overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={code}
              onChange={(value) => onCodeChange(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                wrappingIndent: "same",
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Değişkenler</h4>
          <div className="h-[400px] border rounded-md overflow-auto p-4">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">İsim</th>
                  <th className="pb-2">Değer</th>
                  <th className="pb-2">Tip</th>
                </tr>
              </thead>
              <tbody>
                {variables.map((variable, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2 font-mono">{variable.name}</td>
                    <td className="py-2">
                      <div className="font-mono">
                        {JSON.stringify(variable.value)}
                      </div>
                      {variable.previousValue !== undefined && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Önceki: {JSON.stringify(variable.previousValue)}
                        </div>
                      )}
                    </td>
                    <td className="py-2 text-muted-foreground">{variable.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 