"use client";

import { UsernameRequest, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UsernameFormProps {
  user: Pick<User, "id" | "username">;
}

const UsernameForm: FC<UsernameFormProps> = ({ user }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      username: user?.username || "",
    },
  });

  const { toast } = useToast();

  const { mutate: changeUsername } = useMutation({
    mutationFn: async (payload: UsernameRequest) => {
      const { data } = await axios.patch("/api/account/username", payload);
      return data;
    },
    onError(err) {
      if (err instanceof AxiosError) {
        if (err.response?.status == 409) {
          return toast({
            title: "Username taken",
            description: err.response.data,
            variant: "destructive",
          });
        }
      }
      return toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    },
    onSuccess(value) {
      return toast({
        title: "Success",
        description: `You changed your username to ${value}.`,
      });
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => changeUsername(values))}>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>Please enter a new display name.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("username")}
            />

            {errors?.username && (
              <p className="px-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Change name</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UsernameForm;
