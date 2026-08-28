import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { NotificationProvider } from '../context/NotificationContext';
import { Layout } from '../components/layout/Layout';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  // If page specifies its own layout
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Head>
            <title>CampusResolve | College Grievance & SLA Management System</title>
            <meta name="description" content="AI-assisted College Grievance & Complaint Management System for students, department staff, and administration." />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          {getLayout(<Component {...pageProps} />)}
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
