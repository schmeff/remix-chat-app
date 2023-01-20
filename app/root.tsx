import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from './styles/app.css'
import { useState } from "react";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <html lang="en" className={`${darkMode ? 'dark' : ''}`}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-gray-900 ">
        <nav className="flex place-content-end mx-3 mt-2"><button onClick={() => { setDarkMode(prev => !prev) }}>{darkMode ? <MdOutlineLightMode className="text-white text-4xl" /> : <MdOutlineDarkMode className="text-4xl" />}</button></nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}
