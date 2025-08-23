import loader from '@/assets/loader.gif';
import Image from 'next/image';

const LoadingPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Image
        src={loader}
        height={80}
        width={80}
        alt='Loading...'
        style={{ width: '10%', height: 'auto' }}
        priority
      />
    </div>
  );
};

export default LoadingPage;
