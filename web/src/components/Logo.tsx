import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <Link className="flex items-center gap-2" href="/">
      <Image src="/logo.svg" alt="logo" width={42} height={42} />
      <p className="text-lg font-semibold hidden sm:flex">CloudVault</p>
    </Link>
  );
};

export default Logo;
