import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import { UserRole } from "@/lib/api/user-api";

interface User {
  id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
  status: string;
  created_at: string;
  last_sign_in?: string;
  updated_at?: string;
}

const editUserFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  roles: z
    .array(
      z.enum([
        "admin",
        "air_quality",
        "tree_management",
        "government_emission",
        "user",
        "revoked",
      ])
    )
    .min(1, "User must have at least one role"),
});

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: z.infer<typeof editUserFormSchema>) => Promise<void>;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: EditUserDialogProps) {
  const form = useForm<z.infer<typeof editUserFormSchema>>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      email: user?.email || "",
      full_name: user?.full_name || "",
      roles: user?.roles || ["user"],
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user's details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="full_name"
                className="col-span-3"
                {...form.register("full_name")}
              />
              {form.formState.errors.full_name && (
                <p className="text-red-500 text-sm col-span-3 col-start-2">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                className="col-span-3"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm col-span-3 col-start-2">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roles" className="text-right">
                Roles
              </Label>
              <div className="col-span-3">
                <Select
                  value={form.watch("roles").join(",")}
                  onValueChange={(value) =>
                    form.setValue("roles", value.split(",") as UserRole[])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="air_quality">Air Quality</SelectItem>
                    <SelectItem value="tree_management">
                      Tree Management
                    </SelectItem>
                    <SelectItem value="government_emission">
                      Government Emission
                    </SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.roles?.message && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.roles.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
