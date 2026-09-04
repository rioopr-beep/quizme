import { permanentRedirect } from 'next/navigation';

export default function BlogRootRedirect() {
  permanentRedirect('/blog/en');
}
