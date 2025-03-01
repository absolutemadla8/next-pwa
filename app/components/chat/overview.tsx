import { motion } from "framer-motion";
import Link from "next/link";

import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-36 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col items-center justify-center w-full p-4">
      <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/Group%20482081.png" className="h-44 w-44 object-contain" />
         {/*<p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
         <span>+</span>
          <MessageIcon />
        </p>
        <p>
          This is an open source Chatbot template powered by the Google Gemini
          model built with Next.js and the AI SDK by Vercel. It uses the{" "}
          <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
            streamText
          </code>{" "}
          function in the server and the{" "}
          <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
            useChat
          </code>{" "}
          hook on the client to create a seamless chat experience.
        </p> */}
        {/* <p>
          {" "}
          You can learn more about the AI SDK by visiting the{" "}
          <Link
            className="text-blue-500 dark:text-blue-400"
            href="https://sdk.vercel.ai/docs"
            target="_blank"
          >
            Docs
          </Link>
          .
        </p> */}
      </div>
    </motion.div>
  );
};
