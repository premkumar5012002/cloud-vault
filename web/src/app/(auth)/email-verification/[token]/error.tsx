"use client";

import { FC } from "react";
import { Button, Link } from "@nextui-org/react";

interface Props {
  error: Error;
  reset: () => void;
}

const Error: FC<Props> = (props) => {
  return (
    <>
      <section className="relative z-10 bg-default-50 py-[120px]">
        <div className="container  max-w-3xl mx-auto">
          <div className="w-full px-4">
            <div className="mx-auto text-center">
              <p className="mb-4 text-xl font-semibold leading-none text-danger">
                There was a problem
              </p>
              <h2 className="mb-8 text-5xl font-bold">{props.error.message}</h2>
              <div className="space-x-4 pt-6">
                <Button color="primary" onClick={props.reset}>
                  Try again
                </Button>
                <Button as={Link} variant="bordered" href="/">
                  Go back home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Error;
