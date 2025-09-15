'use client';

import {
  forwardRef,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { newBlog, updateBlog } from '@/actions/blog-actions';
import {
  Button,
  Checkbox,
  InputCustom,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  useEditorExtensions,
  useEditorPerformance,
  useOptimizedEditor,
  useOptimizedUpdateContent,
} from '@/hooks/use-editor-extensions';
import { useEditorImages } from '@/hooks/use-editor-images';
import { categories } from '@/lib/helpers';
import {
  blogAtom,
  fileAtoms,
  imageAtoms,
  imageCountAtoms,
  imageUrlAtoms,
} from '@/lib/jotai/blog-atoms';
import { editorContentAtom, setEditorAtom } from '@/lib/jotai/editor-atoms';
import type {
  BlogFormValues,
  ExtendedRichTextEditorProps,
  FormType,
  PostProps,
  RichTextEditorRef,
} from '@/lib/types';
import {
  cn,
  extractImageUrls,
  extractImageUrlsFromContent,
  replaceImageSourcesInJSON,
} from '@/lib/utils';
import { EditorContent } from '@tiptap/react';
import { useAtom, useSetAtom } from 'jotai';
import { Loader, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
// import { useFormStatus } from 'react-dom';
import slugify from 'slugify';
import { toast } from 'sonner';

import { ImagePreview } from '../rich-text-editor/image-preview';
import { useImagePaste } from '../tiptap/extensions/image-paste';
import { Toolbar } from '../tiptap/toolbar';

type BlogFormProps = {
  type: FormType;
  blogValue?: BlogFormValues[];
  blogId?: string;
  slug?: string;
  blog?: PostProps;
};

type ImageInfo = {
  src: string;
  id: string;
  alt: string;
};

const BlogForm = forwardRef<RichTextEditorRef, ExtendedRichTextEditorProps>(
  (
    {
      value = '',
      slug,
      onChange,
      onBlur,
      placeholder = 'Type your text here and select words to format them...',
      error,
      name,
      type,
      className = '',
      // routeConfig,
      // startUpload,
      maxImages = 8,
      fileToImageIdMap,
      blog,
    },
    ref
  ) => {
    console.log('🚀 ~ blog:', blog);
    const editorRef = useRef<HTMLDivElement>(null);
    const [postData, setPostData] = useAtom(blogAtom);
    console.log('🚀 ~ postData:', postData);
    const [content, setContent] = useAtom(editorContentAtom);
    const [imageCount, setImageCount] = useAtom(imageCountAtoms);
    // const [mounted, setMounted] = useState(false);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastAutoSlug, setLastAutoSlug] = useState('');
    const blogRef = useRef<HTMLFormElement>(null);
    const [localErrors, setLocalErrors] = useState<Record<string, string[]>>(
      {}
    );
    const [imageFiles, setImageFiles] = useAtom(fileAtoms);
    const [imgUrl, setImgUrl] = useAtom(imageUrlAtoms);
    const [images, setImages] = useAtom(imageAtoms);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const setEditor = useSetAtom(setEditorAtom);
    const { extensions, lowlight } = useEditorExtensions();

    // Add timing logs to suspect areas
    // console.time('expensive-operation');
    // Your code here
    // console.timeEnd('expensive-operation');

    // Or use Performance API
    // const start = performance.now();
    // Your code here
    // const end = performance.now();
    // console.log(`Operation took ${end - start}ms`);

    const router = useRouter();
    const editor = useOptimizedEditor({
      value,
      setContent,
      setHasUnsavedChanges,
      setEditor,
    });

    // const { editor, scrollToEditorPosition, isScrolling } =
    //   useOptimizedEditorWithScroll({
    //     value,
    //     setContent,
    //     setHasUnsavedChanges,
    //     setEditor,
    //     clickScrollOptions: {
    //       enabled: true,
    //       scrollOffset: 100,
    //       animationDuration: 600,
    //       excludeSelectors: [
    //         'button',
    //         'input',
    //         'textarea',
    //         'select',
    //         'a',
    //         '.ProseMirror-menubar',
    //         '.toolbar',
    //         '[data-toolbar]',
    //         '.floating-menu',
    //         '.bubble-menu',
    //         '.image-resize-handle',
    //       ],
    //     },
    //   });

    useEffect(() => {
      if (blog && type === 'update') {
        setPostData(blog);
      }
    }, [setPostData]);

    // Add this to debug
    useEffect(() => {
      console.log('🔄 Value changed:', value);
    }, [value]);

    // Also check if extensions are stable
    useEffect(() => {
      console.log('🔧 Extensions changed:', extensions);
    }, [extensions]);

    // useEffect(() => {
    //   setMounted(true);
    // }, []);

    // const [data, action, isPending] = useActionState(
    //   async (prevState: unknown, formData: FormData) => {
    //     console.log('🔍 FormData entries:');
    //     for (const [key, value] of formData.entries()) {
    //       console.log(`${key}:`, value);
    //     }

    //     const jsonContent = editor?.getJSON();
    //     const jsonString = JSON.stringify(jsonContent);

    //     let allImgUrls: ImageInfo[] = [];
    //     let newlyUploadedImages: ImageInfo[] = [];

    //     const urls = extractImageUrls(postData.content);

    //     const existingImgUrls = urls
    //       .filter((img) => img.src.startsWith('https://hz9t4nphtm.ufs.sh'))
    //       .map((dat) => ({
    //         src: dat.src,
    //         id: dat.src.split('/').pop() || dat.id,
    //         alt: dat.id,
    //       }));
    //     if (pendingImages.length > 0) {
    //       const filesToUpload = pendingImages.map((img) => img.file);
    //       const uploaded = await startUpload(filesToUpload);
    //       uploaded?.forEach((file) => {
    //         updateImageUrl(file.key, file.ufsUrl);
    //       });
    //       const newBlogImg = uploaded?.map((img) => img.ufsUrl) || [];
    //       setImgUrl(newBlogImg);

    //       newlyUploadedImages =
    //         uploaded?.map((file) => ({
    //           src: file.ufsUrl,
    //           id: file.key,
    //           alt: file.name,
    //         })) ?? [];

    //       allImgUrls = [...existingImgUrls, ...newlyUploadedImages];

    //       setPostData((prev) => ({
    //         ...prev,
    //         images: allImgUrls.map((img) => img.src),
    //       }));
    //     }

    //     const curImg = postData.images || [];

    //     const contentImageUrls = extractImageUrlsFromContent(postData.content);

    //     const stillUsedExistingImages = curImg.filter((imgUrl) =>
    //       contentImageUrls.includes(imgUrl)
    //     );

    //     const allImages = [
    //       ...stillUsedExistingImages,
    //       ...allImgUrls.map((img) => img.src),
    //     ];
    //     const uniqueImages = [...new Set(allImages)];

    //     const updatedContent = replaceImageSourcesInJSON(
    //       jsonString,
    //       allImgUrls
    //     );

    //     if (updatedContent) {
    //       setPostData((prev) => ({
    //         ...prev,
    //         content: updatedContent,
    //       }));
    //     }

    //     try {
    //       // Extract data from FormData and convert to expected format
    //       const blogData = {
    //         id: blog?.id as string,
    //         slug: formData.get('slug') as string,
    //         title: formData.get('title') as string,
    //         content: jsonString as string,
    //         category: formData.get('category') as string,
    //         anonymous: formData.has('anonymous')
    //           ? formData.get('anonymous') === 'true'
    //           : undefined,
    //         featured: formData.has('featured')
    //           ? formData.get('featured') === 'true'
    //           : undefined,
    //         // Add comments if needed
    //         // comments: formData.has('comments') ? JSON.parse(formData.get('comments') as string) : undefined
    //       };

    //       console.log(
    //         '🔍 Original content sample:',
    //         postData.content.substring(0, 200)
    //       );
    //       console.log('🔍 Images to replace:', allImgUrls);
    //       console.log(
    //         '🔍 Updated content sample:',
    //         updatedContent.substring(0, 200)
    //       );
    //       console.log('📦 FormData content:', formData.get('content'));

    //       const newBlogData = {
    //         ...blogData,
    //         content: updatedContent,
    //         images: allImgUrls.map((img) => img.src),
    //       };

    //       const updateBlogData = {
    //         ...blogData,
    //         content: updatedContent,
    //         images: allImgUrls.map((img) => img.src),
    //       };

    //       const res =
    //         type === 'create'
    //           ? await newBlog(prevState, newBlogData)
    //           : await updateBlog({ ...updateBlogData, slug: postData.slug });

    //       if (!res.error) {
    //         toast.success(res.message);
    //         setImageFiles([]);
    //         setImgUrl([]);
    //         setPendingImages([]);

    //         if (images) {
    //           setImages([]);
    //         }
    //         router.push('/blogs');
    //       } else {
    //         toast.error(res.message);
    //       }

    //       return res;
    //     } catch (err) {
    //       console.error('Error creating blog:', err);
    //       return {
    //         error: true,
    //         message:
    //           err instanceof Error ? err.message : 'Error creating new blog',
    //       };
    //     }
    //   },
    //   {
    //     error: false,
    //     message: '',
    //   }
    // );

    const [data, action, isPending] = useActionState(
      async (prevState: unknown, formData: FormData) => {
        // console.log('🔍 FormData entries:');
        for (const [key, value] of formData.entries()) {
          // console.log(`${key}:`, value);
        }

        // Get the raw JSON from editor
        const jsonContent = editor?.getJSON();

        if (!jsonContent) {
          return {
            error: true,
            message: 'No content found in editor',
          };
        }

        let allImgUrls: ImageInfo[] = [];
        let newlyUploadedImages: ImageInfo[] = [];

        const urls = extractImageUrls(postData.content);

        const existingImgUrls = urls
          .filter((img) => img.src.startsWith('https://hz9t4nphtm.ufs.sh'))
          .map((dat) => ({
            src: dat.src,
            id: dat.src.split('/').pop() || dat.id,
            alt: dat.id,
          }));

        if (pendingImages.length > 0) {
          const filesToUpload = pendingImages.map((img) => img.file);
          const uploaded = await startUpload(filesToUpload);
          uploaded?.forEach((file) => {
            updateImageUrl(file.key, file.ufsUrl);
          });
          const newBlogImg = uploaded?.map((img) => img.ufsUrl) || [];
          setImgUrl(newBlogImg);

          newlyUploadedImages =
            uploaded?.map((file) => ({
              src: file.ufsUrl,
              id: file.key,
              alt: file.name,
            })) ?? [];

          allImgUrls = [...existingImgUrls, ...newlyUploadedImages];

          setPostData((prev) => ({
            ...prev,
            images: allImgUrls.map((img) => img.src),
          }));
        }

        const curImg = postData.images || [];
        const contentImageUrls = extractImageUrlsFromContent(postData.content);
        const stillUsedExistingImages = curImg.filter((imgUrl) =>
          contentImageUrls.includes(imgUrl)
        );

        const allImages = [
          ...stillUsedExistingImages,
          ...allImgUrls.map((img) => img.src),
        ];
        const uniqueImages = [...new Set(allImages)];

        // IMPORTANT: Update the JSON structure, not convert to HTML
        let updatedJsonContent = jsonContent;

        if (allImgUrls.length > 0) {
          // Function to update image URLs in JSON structure
          updatedJsonContent = updateImageUrlsInJsonContent(
            jsonContent,
            allImgUrls
          );
        }

        // Convert the final JSON to string for storage
        const finalContentString = JSON.stringify(updatedJsonContent);

        if (updatedJsonContent) {
          setPostData((prev) => ({
            ...prev,
            content: finalContentString, // Keep it as JSON string
          }));
        }

        const getBoolean = (key: string) => {
          const value = formData.get(key);
          return value === 'true' || value === 'on';
        };

        try {
          const blogData = {
            id: blog?.id as string,
            slug: formData.get('slug') as string,
            title: formData.get('title') as string,
            content: finalContentString, // ← Always save as JSON string
            category: formData.get('category') as string,
            excerpt: formData.get('excerpt') as string,
            // anonymous: formData.has('anonymous')
            //   ? formData.get('anonymous') === 'true'
            //   : undefined,
            anonymous: getBoolean('anonymous'),

            featured: getBoolean('featured'),
            // featured: formData.has('featured')
            //   ? formData.get('featured') === 'true'
            //   : undefined,
          };

          console.log('Anonymous raw:', formData.get('anonymous'));
          console.log('Featured raw:', formData.get('featured'));

          console.log(
            '🔍 Final JSON content sample:',
            finalContentString.substring(0, 200)
          );
          // console.log('🔍 Images to update:', allImgUrls);

          const finalBlogData = {
            ...blogData,
            images: uniqueImages, // Use the deduplicated images array
          };

          const res =
            type === 'create'
              ? await newBlog(prevState, finalBlogData)
              : await updateBlog({ ...finalBlogData, slug: postData.slug });

          if (!res.error || !res.errors) {
            toast.success(res.message);
            setImageFiles([]);
            setImgUrl([]);
            setPendingImages([]);

            if (images) {
              setImages([]);
            }
            router.push('/blogs');
          } else {
            toast.error('something went wrong');
          }

          return res;
        } catch (err) {
          console.error('Error creating blog:', err);
          return {
            error: true,
            message:
              err instanceof Error ? err.message : 'Error creating new blog',
          };
        }
      },
      {
        error: false,
        message: '',
      }
    );

    useEffect(() => {
      if (data.errors) {
        setLocalErrors(data.errors);
      }
    }, [data.errors]);

    // Helper function to update image URLs in JSON content structure
    function updateImageUrlsInJsonContent(
      jsonContent: any,
      imageUrls: ImageInfo[]
    ): any {
      if (!jsonContent || !jsonContent.content) return jsonContent;

      const updateNode = (node: any): any => {
        if (node.type === 'image' && node.attrs?.src) {
          // Find matching image URL to replace
          const matchingImage = imageUrls.find(
            (img) =>
              node.attrs.src.includes(img.id) || node.attrs.src === img.src
          );

          if (matchingImage) {
            return {
              ...node,
              attrs: {
                ...node.attrs,
                src: matchingImage.src,
                alt: matchingImage.alt,
              },
            };
          }
        }

        // Recursively update child nodes
        if (node.content && Array.isArray(node.content)) {
          return {
            ...node,
            content: node.content.map(updateNode),
          };
        }

        return node;
      };

      return {
        ...jsonContent,
        content: jsonContent.content.map(updateNode),
      };
    }

    const jsonData = editor?.getJSON();
    useEffect(() => {
      if (postData.title) {
        const autoSlug = slugify(postData.title).toLowerCase();
        setLastAutoSlug(autoSlug);
        setPostData((prev) => ({
          ...prev,
          slug: autoSlug,
        }));
      }
    }, [postData.title, isSlugManuallyEdited, setPostData]);

    useEffect(() => {
      if (blog?.slug && type === 'update') {
        setPostData((prev) => ({
          ...prev,
          slug: blog.slug,
        }));

        setIsSlugManuallyEdited(true);
        setLastAutoSlug(blog.slug);
      }
    }, [blog?.slug, type, setPostData]);

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSlug = e.target.value;

      const autoSlug = slugify(postData.title || '');
      if (newSlug !== autoSlug && newSlug !== lastAutoSlug) {
        setIsSlugManuallyEdited(true);
      }

      if (newSlug === '') {
        setIsSlugManuallyEdited(false);
      }

      setPostData((prev) => ({
        ...prev,
        slug: newSlug,
      }));

      setLocalErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name]; // Remove the property
        return newErrors;
      });
    };

    const resetSlugToAuto = () => {
      setIsSlugManuallyEdited(false);
      const autoSlug = slugify(postData.title || '');
      setPostData((prev) => ({
        ...prev,
        slug: autoSlug,
      }));
    };

    useEffect(() => {
      if (editor && blog?.content) {
        // Load the saved JSON content
        const parsedContent =
          typeof blog?.content === 'string'
            ? JSON.parse(blog?.content)
            : blog?.content;

        editor.commands.setContent(parsedContent);
      }
    }, [editor, blog?.content]);

    useEditorPerformance(editor);
    const handleContentChange = useCallback(
      (value: string) => {
        setPostData((prev) => ({
          ...prev,
          content: value,
        }));
      },
      [setPostData]
    );

    const updateContent = useOptimizedUpdateContent(
      editorRef,
      setImageCount,
      handleContentChange
    );

    const {
      insertImage,
      previews,
      fileInputRef,
      handleImageUpload,
      handleImageButtonClick,
      handleFileInputChange,
      getRootProps,
      getInputProps,
      startUpload,
      removeImageById,
      updateImageUrl,
      pendingImages,
      setPendingImages,
    } = useEditorImages(
      editorRef as React.RefObject<HTMLDivElement>,
      maxImages,
      // routeConfig,
      updateContent
    );

    useImagePaste(editor, editorRef);

    // const SubmitButton = () => {
    //   const { pending } = useFormStatus();

    //   return (
    //     <Button
    //       disabled={pending}
    //       size={'sm'}
    //       className='rounded-md px-6 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-600/70'
    //       variant='outline'
    //       type='submit'
    //     >
    //       {pending ? (
    //         <>
    //           <Loader className='mr-2 h-4 w-4 animate-spin' />
    //           Submitting...
    //         </>
    //       ) : (
    //         <span className='flex items-center gap-1 text-xs'>
    //           <BookPlusIcon className='svg size-4 text-gray-200' />{' '}
    //           <span>Add Blog</span>
    //         </span>
    //       )}
    //     </Button>
    //   );
    // };

    const handleFieldChange =
      (fieldName: keyof typeof postData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (fieldName === 'slug') {
          const newSlug = e.target.value;

          const autoSlug = slugify(postData.title || '');
          if (newSlug !== autoSlug && newSlug !== lastAutoSlug) {
            setIsSlugManuallyEdited(true);
          }

          if (newSlug === '') {
            setIsSlugManuallyEdited(false);
          }
        }

        setPostData((prev) => ({
          ...prev,
          [fieldName]: value,
        }));

        // Remove the field error entirely instead of setting to undefined
        fieldName === 'title' &&
          setLocalErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            delete newErrors['slug'];
            return newErrors;
          });
      };

    const SubmitButton = () => {
      const { pending } = useFormStatus();

      return (
        <Button
          disabled={pending}
          className='w-full'
          variant='outline'
          type='submit'
        >
          {pending ? (
            <>
              <Loader className='mr-2 h-4 w-4 animate-spin' />
              Submitting...
            </>
          ) : type === 'create' ? (
            'Create Blog'
          ) : (
            'Update Blog'
          )}
        </Button>
      );
    };

    // const parsed = JSON.parse(postData.content);
    // const codeNode = parsed.content.find(
    //   (node: any) => node.type === 'codeBlock'
    // );

    // const htmlFragments = parsed.content.map((node: any, index: number) => {
    //   try {
    //     if (node.type === 'codeBlock') {
    //       const code = node.content[0].text || '';
    //       const language = node.attrs.language || 'plaintext';
    //       const tree = lowlight?.highlight(language, code);
    //       const htmlRes = tree && toHtml(tree);
    //       return `<div class="hljs code-block-custom w-full m-auto" key="code-${index}">${htmlRes}</div>`;
    //     }
    //   } catch (error) {
    //     console.error('Error highlighting code:', error);

    //     return `<pre class="code-block-custom w-full m-auto"><code class="language-${language}">${code}</code></pre>`;
    //   }

    //   const htmlData = generateHTML(
    //     { type: 'doc', content: [node] },
    //     extensions
    //   );

    //   const hasTable = hasTag(htmlData, 'table');

    //   const tableClass = hasTable ? 'tableWrapper' : '';

    //   return `<div class="content-block-wrapper ${tableClass}" key="block-${index}">${htmlData}</div>`;
    // });

    // const code = codeNode ? codeNode.content[0].text : '';
    // const language = codeNode ? codeNode.attrs.language : 'plaintext';

    // const htmlCont = htmlFragments.join('');
    // // Generate HTML when component mounts and content is available
    // useEffect(() => {
    //   const processContent = async () => {
    //     if (mounted && content) {
    //       setIsLoading(true);

    //       try {
    //         // Dynamic import to ensure client-side only
    //         const { createLowlight, all } = await import('lowlight');
    //         const { toHtml } = await import('hast-util-to-html');

    //         const lowlight = createLowlight(all);
    //         // Register languages...

    //         // Process content...
    //       } catch (error) {
    //         console.error('Error processing content:', error);
    //       } finally {
    //         setIsLoading(false);
    //       }
    //     }
    //   };
    //   processContent();
    // }, [mounted, content]);

    return (
      <div className='container mx-auto w-full min-w-2xl p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold dark:text-gray-200'>
            <u>{type === 'create' ? 'Create New Post' : 'Edit Blog'}</u>
          </h1>
          <p className='mt-2 text-blue-300 italic'>
            {type === 'create'
              ? 'Write and format your post using the rich text editor below.'
              : 'Edit your Post'}
          </p>
        </div>

        <form action={action} className='space-y-2' ref={blogRef}>
          {/* Title Field */}
          <input type='hidden' name='content' value={postData.content} />

          <div className='flex flex-col justify-between gap-8 sm:flex-row'>
            <div className='flex-1'>
              <div className='flex w-fit flex-grow items-baseline'>
                <Label
                  className={cn(
                    'text-nowrap',
                    localErrors?.title ? 'text-red-500' : ''
                  )}
                  htmlFor='title'
                >
                  Title *
                </Label>
                <div className='flex flex-col'>
                  <InputCustom
                    name='title'
                    id='title'
                    aria-describedby='title-error'
                    placeholder={cn(
                      localErrors?.title ? localErrors.title[0] : 'Title'
                    )}
                    value={postData.title || ''}
                    // required
                    className={cn(
                      'h-8 w-full flex-1',
                      localErrors?.title
                        ? 'border-red-500 placeholder:text-red-500'
                        : ''
                    )}
                    // onChange={(e) => {
                    //   setPostData((prev) => ({
                    //     ...prev,
                    //     title: e.target.value,
                    //   }));
                    // }}
                    onChange={handleFieldChange('title')}
                  />
                  {localErrors?.title && (
                    <p className='text-[10px] text-red-500'>
                      {localErrors.title?.[0]}
                    </p>
                  )}

                  {/* <pre>{JSON.stringify(field, null, 2)}</pre> */}
                </div>
              </div>
            </div>

            <div className='flex-1'>
              <div className='flex w-fit flex-grow items-baseline'>
                <Label
                  className={cn(
                    'text-nowrap',
                    localErrors?.slug ? 'text-red-500' : ''
                  )}
                  htmlFor='slug'
                >
                  Slug **
                </Label>

                <div>
                  <div className='relative flex w-full flex-col items-center'>
                    <InputCustom
                      type='text'
                      name='slug'
                      id='slug'
                      aria-describedby='slug-error'
                      placeholder='Slug'
                      value={postData.slug || ''}
                      // required
                      className={cn(
                        'h-8 w-full flex-1',
                        localErrors?.slug ? 'border-red-500' : ''
                      )}
                      onChange={handleFieldChange('slug')}
                    />
                    <div className='flex gap-4'>
                      {localErrors?.slug && (
                        <p className='text-[10px] text-nowrap text-red-500'>
                          {localErrors.slug?.[0]}
                        </p>
                      )}
                      {/* {isSlugManuallyEdited && (
                      <button
                      type='button'
                      onClick={resetSlugToAuto}
                      className='absolute right-2 text-xs text-blue-500 hover:text-blue-700'
                      title='Reset to auto-generated slug'
                      >
                      Auto
                      </button>
                      )} */}
                      <p className='w-full text-center text-[10px] text-blue-300/40'>
                        ** Slug harus unik
                      </p>
                    </div>
                  </div>
                  {/* <pre>{JSON.stringify(field, null, 2)}</pre> */}

                  {/* {!field.value && (
                        
                      )} */}
                </div>
              </div>
            </div>

            {/* Category Field */}
            <div className='flex-1'>
              <div className='flex w-fit flex-grow items-baseline'>
                <Label
                  className={cn(
                    'text-nowrap',
                    localErrors?.title ? 'text-red-500' : ''
                  )}
                  htmlFor='category'
                >
                  Category
                </Label>
                <Select
                  name={'category'}
                  onValueChange={(value) => {
                    console.log('🚀 ~ value:', value);
                    return setPostData((prev) => ({
                      ...prev,
                      category: value,
                    }));
                  }}
                  defaultValue={postData.category || ''}
                >
                  <SelectTrigger
                    className={cn(
                      'h-8 w-full flex-1',
                      localErrors?.category ? 'border-red-500' : ''
                    )}
                  >
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem
                        key={`${cat.name}-${cat.description}`}
                        value={cat.name}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localErrors?.category && (
                  <p className='text-[10px] text-nowrap text-red-500'>
                    {localErrors.category?.[0]}
                  </p>
                )}
                {/* <pre>{JSON.stringify(field.value, null, 2)}</pre> */}
              </div>
            </div>
          </div>
          <div className='flex-1'>
            <div className='flex w-fit flex-grow items-baseline'>
              <Label className='text-[12px] text-nowrap' htmlFor='excerpt'>
                Excerpt *
              </Label>
              <div className='flex flex-col'>
                <InputCustom
                  name='excerpt'
                  id='excerpt'
                  aria-describedby='excerpt-error'
                  placeholder='Excerpt'
                  value={postData.excerpt || ''}
                  // required
                  className='h-6 w-full flex-1 text-[12px] placeholder:text-[12px]'
                  onChange={(e) => {
                    setPostData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }));
                  }}
                />
                {localErrors?.excerpt && (
                  <p className='text-sm text-red-500'>
                    {localErrors.excerpt?.[0]}
                  </p>
                )}
                {/* <pre>{JSON.stringify(field, null, 2)}</pre> */}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor='content' className='text-gray-700'>
              Content *
            </Label>

            <div className='size-full rounded-2xl bg-[#F9FBFD]/90 px-4 py-2 dark:bg-stone-800/50 print:overflow-visible print:bg-white print:p-0'>
              <section>
                <ImagePreview
                  content={postData.content}
                  slug={slug || postData.slug}
                  removeImageById={removeImageById}
                />

                {pendingImages.length > 0 && (
                  <div className='flex w-full justify-center pt-1'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={handleImageButtonClick}
                      className='w-fit rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
                    >
                      Add Images ({pendingImages.length} photos){' '}
                      {pendingImages[0].id}
                    </Button>
                  </div>
                )}
              </section>
              <Toolbar
                editorRef={editorRef}
                fileInputRef={fileInputRef}
                maxImages={maxImages}
                updateContent={updateContent}
                handleFileInputChange={handleFileInputChange}
                insertImage={insertImage}
                getInputProps={getInputProps}
                getRootProps={getRootProps}
              />
              {/* <Ruler /> */}
              <div className='mx-auto flex justify-center py-0.5 text-gray-700 print:py-0'>
                <EditorContent
                  editor={editor}
                  ref={editorRef}
                  className='editor-wrapper editor-paper w-full max-w-[816px] shadow-2xl/30'
                />
              </div>
            </div>

            {/* <pre className='w-3xl break-words whitespace-pre-wrap'>
                      {JSON.stringify(
                        { images, prevImg, contentHtml, field },
                        null,
                        2
                      )}
                    </pre> */}
          </div>
          <div className='m-auto flex max-w-[816px] items-center gap-2 pt-4'>
            <Checkbox
              id='anonymous'
              name='anonymous'
              checked={postData.anonymous}
              onCheckedChange={(checked) => {
                setPostData((prev) => ({
                  ...prev,
                  anonymous: Boolean(checked),
                }));
              }}
              className='dark:bg-accent'
            />

            <div className=''>
              <Label className='text-base' htmlFor='anonymous'>
                Anonymous
              </Label>
            </div>
          </div>
          {/* Form Actions */}
          <div className='m-auto flex max-w-[816px] gap-4 pt-2'>
            <Button
              type='submit'
              size={'sm'}
              className='rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isPending ? (
                <span className='flex items-center gap-2'>
                  <Loader size={26} className='animate-spin' />{' '}
                  {type === 'create' ? 'Creating...' : 'Updating...'}
                </span>
              ) : (
                <span>{type === 'create' ? 'Create Post' : 'Update Post'}</span>
              )}
            </Button>

            {/* <SubmitButton /> */}

            <Button
              type='button'
              variant={'ghost'}
              size={'sm'}
              className={cn(
                'rounded-md bg-amber-600/20 px-6 py-2 text-gray-700 shadow-2xl/30 focus:ring-2 focus:ring-gray-500 focus:outline-none dark:bg-gray-300 dark:hover:bg-gray-300/80 dark:hover:text-gray-500'
              )}
            >
              <span className='flex items-center gap-1 text-xs'>
                <RotateCcw className='svg size-4 dark:text-gray-600' /> Reset
              </span>
            </Button>
          </div>
        </form>

        {/* Content Preview */}
        {postData && (
          <div className='mt-8 rounded-lg bg-gray-50 p-6'>
            <h6 className='mb-4 text-sm font-semibold text-gray-900'>
              Content Preview
              <pre className='text-wrap'>
                {JSON.stringify(editor?.getJSON(), null, 2)}
              </pre>
            </h6>

            {/* <BlogContent content={formData.content} /> */}
          </div>

          // <div className='dark:bg-accent/90 flex flex-col items-center justify-center py-8'>
          //   <div className='not-prose'>
          //     <div
          //       className={cn(
          //         'prose prose-sm max-w-none px-8 py-2 text-justify whitespace-pre-wrap dark:bg-black/20 dark:text-stone-100',
          //         `language-${language}`
          //       )}
          //       dangerouslySetInnerHTML={{
          //         __html: htmlCont,
          //       }}
          //     />
          //   </div>
          //   <span className='mx-auto flex w-full justify-center text-center'>
          //     <Ellipsis size={24} className='text-black' />
          //   </span>
          //   <pre>{JSON.stringify(htmlCont, null, 2)}</pre>
          // </div>
        )}

        {/* HTML Output (for debugging) */}
        {/* {process.env.NODE_ENV === 'development' && contentValue && (
        <div className='mt-8'>
          <details className='text-sm'>
            <summary className='cursor-pointer font-medium text-gray-600 hover:text-gray-800'>
              View HTML Output (Dev Only)
            </summary>
            <pre className='mt-2 overflow-x-auto rounded border bg-gray-100 p-3 text-lg text-wrap dark:text-stone-800'>
              {formData.content}
            </pre>
          </details>
        </div>
      )} */}
      </div>
    );
  }
);

export default BlogForm;
