import Header from './Header';
import BottomTabBar from './BottomTabBar';
import AnimatedOutlet from './AnimatedOutlet';

const Layout = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Header />
    <main className="flex-1 container mx-auto px-4 py-6 pb-24 lg:pb-6">
      <AnimatedOutlet />
    </main>
    <BottomTabBar />
  </div>
);

export default Layout;
