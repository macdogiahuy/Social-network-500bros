import HomeView from '@/sections/home/view/home-view';

export const metadata = {
  title: 'Home Page',
};

export const dynamic = 'force-dynamic';

export default function Home() {
  return <HomeView />;
}
