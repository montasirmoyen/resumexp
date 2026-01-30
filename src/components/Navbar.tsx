import Image from 'next/image';

export default function Navbar() {
  return (
    <header className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Image className="p-2" src="/logo.png" alt="Sparkle" width={50} height={50} />
              <h1 className="text-2xl font-bold">enhanceme</h1>
            </div>
          </div>
        </div>
      </header>
    ); 
}