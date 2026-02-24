"use client";

import { TurnControls } from "@/components/turnLogDemo/TurnControls";
import { ActionLog } from "@/components/turnLogDemo/ActionLog";

export default function TurnLogDemo() {
    return (
        <div className="space-y-4">
            <TurnControls />
            <ActionLog />
        </div>
    );
}
