"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Plus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const createWorkflow = useMutation(api.workflows.createWorkflow);
  const workflows = useQuery(
    api.workflows.getWorkflows,
    user ? { clerkId: user.id } : "skip"
  );

  const handleCreate = async () => {
    if (!user || !name) return;
    const id = await createWorkflow({
      name,
      description: "",
      clerkId: user.id,
    });
    setOpen(false);
    router.push(`/builder/${id}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Agents</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Agent Name (e.g. Support Bot)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workflows?.map((wf) => (
          <Card
            key={wf._id}
            onClick={() => router.push(`/builder/${wf._id}`)}
            className="cursor-pointer hover:shadow-md transition"
          >
            <CardHeader>
              <CardTitle>{wf.name}</CardTitle>
              <CardDescription>
                {new Date(wf.lastSaved).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-between">
                Edit <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {workflows?.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-10">
            No agents yet. Create one!
          </p>
        )}
      </div>
    </div>
  );
}
