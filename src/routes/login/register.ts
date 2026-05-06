import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { syncRegisteredUser } from "@/modules/userRegisterSync";

const router = express.Router();

function normalizeUsername(username: string): string {
  return username.trim();
}

async function createUserId(): Promise<number> {
  const latestUser = await u.db("o_user").max<{ maxId?: number | null }>("id as maxId").first();
  return Number(latestUser?.maxId || 0) + 1;
}

export default router.post(
  "/",
  validateFields({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
  async (req, res) => {
    const username = normalizeUsername(req.body.username);
    const password = req.body.password;

    if (!username) return res.status(400).send(error("用户名不能为空"));

    const exists = await u.db("o_user").where("name", "=", username).first();
    if (exists) return res.status(400).send(error("用户名已存在"));

    const id = await createUserId();
    await u.db("o_user").insert({
      id,
      name: username,
      password,
    });

    await syncRegisteredUser({ username, password, userId: id });

    return res.status(200).send(success({ id, name: username }, "注册成功"));
  },
);

