/**
 * @file block:footer-01
 * @requires @seed-design/react@^2.0.0
 * @requires @seed-design/css@^2.0.0
 **/
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { Box, Footer, HStack, Text, VStack } from "@seed-design/react";

export interface Footer01Link {
  href: string;
  label: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
}

export interface Footer01Props {
  links: readonly Footer01Link[];
  legal?: ReactNode;
}

/**
 * Minimal Footer block (links + optional company info).
 * @see https://seed-design.io/react/blocks/footer
 */
export function Footer01({ links, legal }: Footer01Props) {
  return (
    <Box
      as="footer"
      width="100%"
      style={{ maxWidth: "var(--container-content)", marginInline: "auto" }}
      paddingX="x8"
      paddingY="x10"
    >
      <VStack gap="x4" align="flex-start">
        <HStack gap="x6" wrap align="center">
          {links.map((link) => (
            <Footer.LinkText
              key={link.label}
              size="medium"
              href={link.href}
              target={link.target}
              rel={link.rel}
            >
              {link.label}
            </Footer.LinkText>
          ))}
        </HStack>

        {legal ? (
          <Text textStyle="t3Regular" color="fg.neutralSubtle">
            {legal}
          </Text>
        ) : null}
      </VStack>
    </Box>
  );
}

export default Footer01;

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
