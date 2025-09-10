'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { createNewBlog } from '@/actions/blog-actions';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputCustom,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useZodForm } from '@/hooks/use-zod-form';
import { blogDefaultValue } from '@/lib/constants';
import { categories } from '@/lib/helpers';
import {
  blogAtom,
  fileAtoms,
  imageAtoms,
  imageCountAtoms,
  pendingImgAtoms,
} from '@/lib/jotai/blog-atoms';
import { blogSchema, BlogSchema } from '@/lib/schemas/blog-schemas';
import {
  BlogFormValues,
  FormType,
  ImageData,
  PostProps,
  RichTextEditorRef,
} from '@/lib/types';
import { useUploadThing } from '@/lib/uploadthing';
import { replaceImageSourcesAndIds } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom, useSetAtom } from 'jotai';
import { Loader, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import slugify from 'slugify';
import { toast } from 'sonner';

import { ControlledRichTextEditor } from '../rich-text-editor/controlled-rich-text-editor';
import { RichTextEditor } from '../rich-text-editor/rich-text-editor';
import BlogContent from './blog-content';

type CreatePostFormProps = {
  type: FormType;
  blogValue?: BlogFormValues[];
  blogId?: string;
  blog?: PostProps;
};

export default function CreatePostForm({
  type,
  blogValue,
  blogId,
  blog: blogData,
}: CreatePostFormProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
  const [formData, setFormData] = useAtom(blogAtom);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [images, setImages] = useAtom(imageAtoms);
  const [imageCount, setImageCount] = useAtom(imageCountAtoms);
  const [imageFiles, setImageFiles] = useAtom(fileAtoms);
  const router = useRouter();

  const methods = useZodForm({
    schema: blogSchema,
    mode: 'onTouched',
    defaultValues: blogDefaultValue,
  });

  const fileToImageIdMap = new Map<File, string>();

  const handleContentChange = useCallback(
    (value: string) => {
      const { onChange } = methods.register('content');

      onChange({ target: { value } });

      setFormData((prev) => ({
        ...prev,
        content: value,
      }));
    },
    [methods, setFormData]
  );

  const updateContent = useCallback(() => {
    if (editorRef?.current) {
      const newContent = editorRef?.current.innerHTML;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newContent;

      const images = tempDiv.querySelectorAll('img');
      setImageCount(images.length);

      if (handleContentChange) {
        handleContentChange(newContent);
      }

      setFormData((prev) => ({
        ...prev,
        content: newContent,
      }));
    }
  }, [handleContentChange, setFormData, setImageCount]);

  const { startUpload, routeConfig } = useUploadThing('imageUploader');
  useEffect(() => {
    if (images) {
      methods.setValue(
        'images',
        images.map((img) => (typeof img === 'string' ? img : ''))
      );

      if (blogData?.images) {
        const newImg = blogData.images.map((img) => ({
          src: img,
          id: img.split('/').pop() ?? '',
        }));
        setImages(newImg);
      }
    }
  }, [blogData?.images, images, methods, methods.setValue, setImages]);

  const img = methods.watch('images');

  const onSubmit = async (data: BlogSchema) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let uploadedData;

      if (pendingImages.length > 0) {
        const filesToUpload = pendingImages.map((img) => img.file);
        const uploaded = await startUpload(filesToUpload);

        uploadedData =
          uploaded?.map((file) => ({
            src: file.ufsUrl,
            id: file.key,
            alt: file.key,
          })) ?? [];
      }

      const updateContent = replaceImageSourcesAndIds(
        formData.content,
        uploadedData ?? []
      );

      const blogData = {
        ...data,
        content: updateContent,
        images: uploadedData,
      } as BlogSchema;

      const response = await createNewBlog(blogData);

      if (response.error) {
        toast.error(response.message);
      } else {
        toast.success('Blog submitted!');
        methods.reset(blogDefaultValue);
        setPendingImages([]);
        setImageFiles([]);
        setImageCount(0);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    }
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setImages([]);
    methods.setValue('title', '');
    methods.setValue('slug', '');
    methods.setValue('category', '');
    methods.setValue('content', '');
    methods.reset();
    setFormData(blogDefaultValue);
    setPendingImages([]);
    setImageCount(0);
    setImageFiles([]);
    setErrors({});
  };
  const contentValue = methods.watch('content');
  const titleValue = methods.watch('title');
  const slugValue = methods.watch('slug');
  const categoryValue = methods.watch('category');
  const imagesValue = methods.watch('images');
  const formValues = methods.watch();
  return (
    <div className='container mx-auto w-full min-w-2xl p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold underline dark:text-gray-200'>
          Create New Post
        </h1>
        <p className='mt-2 text-blue-300 italic'>
          Write and format your post using the rich text editor below.
        </p>
      </div>

      <Form {...methods}>
        <form
          method='POST'
          onSubmit={methods.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          {/* Title Field */}
          <div className='flex flex-col justify-between gap-8 sm:flex-row'>
            <div className='flex-1'>
              <FormField
                control={methods.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='flex w-fit flex-grow items-baseline'>
                    <FormLabel className='text-nowrap'>Title *</FormLabel>
                    <div className='flex flex-col'>
                      <FormControl>
                        <InputCustom
                          type='text'
                          placeholder='Title'
                          required
                          className='w-full flex-1'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setFormData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }));
                          }}
                        />
                      </FormControl>

                      <FormMessage className='w-full text-center text-xs' />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className='flex-1'>
              <FormField
                control={methods.control}
                name='slug'
                render={({ field }) => (
                  <FormItem className='flex w-fit flex-grow items-baseline'>
                    <FormLabel className='text-nowrap'>Slug **</FormLabel>

                    <div className=''>
                      <FormControl>
                        <div>
                          <div className='relative flex w-full items-center'>
                            <InputCustom
                              type='text'
                              placeholder='Slug'
                              required
                              className='w-full flex-1 rounded-r-none'
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setFormData((prev) => ({
                                  ...prev,
                                  slug: e.target.value,
                                }));
                              }}
                            />
                            <Button
                              type='button'
                              size={'sm'}
                              variant={'ghost'}
                              className='-right-13 z-10 h-10 w-fit rounded-l-none border bg-stone-500/30 hover:bg-stone-500/80'
                              onClick={() => {
                                const newSlug = slugify(
                                  methods.getValues('title'),
                                  {
                                    lower: true,
                                  }
                                );
                                methods.setValue('slug', newSlug);

                                methods.trigger('slug');
                              }}
                            >
                              Slug
                            </Button>
                          </div>
                          <p className='w-full text-center text-[10px] text-blue-300/40'>
                            ** Slug harus unik
                          </p>
                        </div>
                      </FormControl>
                      {!field.value && (
                        <FormMessage className='w-full text-center text-xs' />
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Category Field */}
            <div className='flex-1'>
              <FormField
                control={methods.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='flex w-fit items-baseline'>
                    <FormLabel className='text-nowrap'>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className=''>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.description} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            {/* <label className='mb-2 block text-sm font-medium text-gray-700'>
              Content *
            </label>
            <ControlledRichTextEditor
              name='content'
              control={methods.control}
              value={formData.content}
              rules={{ required: 'Content is required' }}
              
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, content: value }))
              }
              
              placeholder='Start writing your post content here...'
            /> */}
            <FormField
              control={methods.control}
              name='content'
              rules={{ required: 'Content is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content *</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      {...field}
                      fileToImageIdMap={fileToImageIdMap}
                      updateContent={updateContent}
                      editorRef={editorRef}
                      name='content'
                      value={field.value || ''}
                      startUpload={startUpload}
                      routeConfig={routeConfig}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      placeholder='Start writing your post content here...'
                      type={type}
                      error={methods.formState.errors.content?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Form Actions */}
          <div className='flex gap-4 pt-2'>
            <Button
              type='submit'
              disabled={methods.formState.isSubmitting || imageFiles.length > 4}
              className='rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              {methods.formState.isSubmitting ? (
                <Loader size={26} className='animate-spin' />
              ) : (
                'Create Post'
              )}
            </Button>
            <Button
              type='button'
              variant={'ghost'}
              onClick={(e) => handleReset(e)}
              disabled={methods.formState.isSubmitting}
              className='rounded-md bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none'
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>

      {/* Content Preview */}
      {contentValue && (
        <div className='mt-8 rounded-lg bg-gray-50 p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Content Preview
          </h3>
          {/* <BlogContent content={contentValue} /> */}
        </div>
      )}

      {/* HTML Output (for debugging) */}
      {process.env.NODE_ENV === 'development' && contentValue && (
        <div className='mt-8'>
          <details className='text-sm'>
            <summary className='cursor-pointer font-medium text-gray-600 hover:text-gray-800'>
              View HTML Output (Dev Only)
            </summary>
            <pre className='mt-2 overflow-x-auto rounded border bg-gray-100 p-3 text-lg text-wrap dark:text-stone-800'>
              {contentValue}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
