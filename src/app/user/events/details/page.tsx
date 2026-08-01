import ClientPage from './ClientPage';

export function generateStaticParams() {
  return [{ eventId: 'app' }];
}

export default function Page({ params }: { params: any }) {
  return <ClientPage params={params} />;
}
