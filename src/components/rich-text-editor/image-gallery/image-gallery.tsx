// import { RefObject } from 'react';

// import AlertDialogButton from '@/components/alert-dialog-button';
// import { Button } from '@/components/ui';
// import { blogAtom, fileAtoms } from '@/lib/jotai/blog-atoms';
// import { useAtom } from 'jotai';
// import { X } from 'lucide-react';
// import Image from 'next/image';

// interface ImageGalleryProps {
//   images: Array<{ src: string; id: string }>;
//   onRemoveImage: (image: string, slug: string, content: string) => void;
//   maxImages: number;
//   currentCount: number;
//   removeImageById: (
//     imgFile: {
//       src: string;
//       id: string;
//     },
//     slug: string,
//     content: string
//   ) => void;
//   handleImageButtonClick: (e: React.MouseEvent) => void;
//   handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   fileInputRef: RefObject<HTMLInputElement | null>;
// }

// export const ImageGallery: React.FC<ImageGalleryProps> = ({
//   images,
//   onRemoveImage,
//   maxImages,
//   currentCount,
//   removeImageById,
//   handleImageButtonClick,
//   handleFileInputChange,
//   fileInputRef,
// }) => {
//   const [imageFiles, setImageFiles] = useAtom(fileAtoms);
//   const [formData, setFormData] = useAtom(blogAtom);
//   const imagesLength = images.length;

//   return (
//     <div className='image-gallery'>
//       <div className='dark:bg-muted/50 rounded-lg pb-4'>
//         <div className='flex flex-wrap justify-center gap-1'>
//           {Array.isArray(images) &&
//             images.map((imgFile, idx) => (
//               <div key={imgFile.src} className='group relative'>
//                 <Image
//                   src={imgFile.src}
//                   alt={imgFile.id}
//                   width={0}
//                   height={0}
//                   className='group-hover:bg-red/70 group-hover:box-sizing h-20 w-20 rounded-sm object-cover object-center group-hover:border-2 group-hover:border-amber-200'
//                   style={{ width: 'auto', height: '100px' }}
//                   data-image-id={imgFile.id}
//                   onError={(e) => console.error('Image failed to load:', e)}
//                 />
//                 <AlertDialogButton
//                   icon={X}
//                   remove={() =>
//                     removeImageById(imgFile, formData?.slug, formData?.content)
//                   }
//                 />
//               </div>
//             ))}
//         </div>
//         {imageFiles.length > 8 && (
//           <p className='text-center text-xs text-red-500 italic'>
//             Maximum of 5 images allowed.
//           </p>
//         )}
//       </div>
//       <input
//         ref={fileInputRef}
//         type='file'
//         accept='image/*'
//         multiple
//         onChange={handleFileInputChange}
//         style={{ display: 'none' }}
//       />
//       {imagesLength > 0 && (
//         <div className='flex w-full justify-center pt-1'>
//           <Button
//             type='button'
//             variant='ghost'
//             size='sm'
//             onClick={handleImageButtonClick}
//             className='w-fit rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
//           >
//             Add Images ({imagesLength} photos)
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };
