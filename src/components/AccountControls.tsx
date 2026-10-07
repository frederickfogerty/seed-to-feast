import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";

export function AccountControls() {
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const del = useServerFn(deleteMyAccount);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const download = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [{ data: profile }, { data: plans }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      supabase.from("garden_plans").select("*").eq("user_id", u.user.id),
    ]);
    const payload = {
      exported_at: new Date().toISOString(),
      account: {
        id: u.user.id,
        email: u.user.email,
        created_at: u.user.created_at,
        email_confirmed_at: u.user.email_confirmed_at,
        last_sign_in_at: u.user.last_sign_in_at,
        metadata: u.user.user_metadata,
      },
      profile,
      garden_plans: plans ?? [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `plot-and-plan-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const remove = async () => {
    setBusy(true);
    try {
      await del();
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      toast.success("Your account and plans have been permanently deleted");
      navigate({ to: "/", replace: true });
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <section className="paper rounded-xl p-6">
      <h2 className="text-2xl">Your data</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Download everything we hold about you, or delete your account for good.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={download}>
          <Download className="mr-1 h-4 w-4" /> Download my data
        </Button>
        <AlertDialog onOpenChange={() => setConfirmText("")}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-1 h-4 w-4" /> Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes your account, profile and every saved plan. It can't be undone. Type DELETE to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={confirmText !== "DELETE" || busy}
                onClick={(e) => {
                  e.preventDefault();
                  remove();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
