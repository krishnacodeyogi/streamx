import type { Metadata } from 'next';
import UploadForm from '@/components/upload/UploadForm';

export const metadata: Metadata = {
  title: 'Upload Video – StreamX',
  description: 'Upload and share your video on StreamX',
};

export default function UploadPage() {
  return (
    <div className="min-h-screen p-4 pb-16">
      <div className="max-w-3xl mx-auto">
        <UploadForm />
      </div>
    </div>
  );
}
