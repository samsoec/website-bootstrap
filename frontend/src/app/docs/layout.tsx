import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import type { ReactNode } from "react";
import "nextra-theme-docs/style.css";
import { DocsLogoutButton } from "./logout-button";

export const metadata = {
  title: {
    default: "CMS Guide",
    template: "%s | CMS Guide",
  },
  description: "Documentation for content editors using the Strapi CMS",
};

const navbar = (
  <Navbar logo={<b>CMS Guide</b>}>
    <DocsLogoutButton />
  </Navbar>
);

const footer = <Footer>Content Management System Documentation</Footer>;

export default async function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap("/docs")}
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
          toc={{ title: "On This Page" }}
          editLink={null}
          feedback={{ content: null }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
