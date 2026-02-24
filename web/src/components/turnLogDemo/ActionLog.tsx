"use client";

import * as React from "react";
import { useTurnLogDemoStore } from "@/lib/turnLogDemo/store";

export function ActionLog() {
    const log = useTurnLogDemoStore((s) => s.log);
    const clearLog = useTurnLogDemoStore((s) => s.clearLog);

    const endRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [log.length]);

    return (
        <div className="rounded border p-3 flex flex-col h-[420px]">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Action Log (Demo)</h2>
                <button className="text-xs underline" onClick={clearLog}>
                    Clear
                </button>
            </div>

            <div className="mt-2 flex-1 overflow-auto space-y-2">
                {log.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No actions yet.</div>
                ) : (
                    log.map((e) => (
                        <div key={e.id} className="text-sm">
                            <div className="text-xs text-muted-foreground">
                                Turn {e.turn} • {e.player} • {new Date(e.ts).toLocaleTimeString()}
                            </div>
                            <div>{e.message}</div>
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>
        </div>
    );
}
