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
      </div>
    </motion.div>
  );
};
