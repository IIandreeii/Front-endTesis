
import Mensajes from "@/components/component/fb-messenger-complete.jsx";


export default function Home() {
  return (
    <Mensajes />
  );
}



import { useRouter } from 'next/router';
import ChatPage from '../components/ChatPage';

const Mensajes = () => {
  const router = useRouter();
  const { chatId } = router.query;

  return <ChatPage chatId={chatId} />;
};

export default Mensajes;
