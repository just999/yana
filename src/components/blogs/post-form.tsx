'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { createNewBlog, updateBlog } from '@/actions/blog-actions';
import {
  Button,
  Checkbox,
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
import { useClearDataOnRoute } from '@/hooks/use-clear-data-on-route';
import { useEditorImages } from '@/hooks/use-editor-images';
import { useZodForm } from '@/hooks/use-zod-form';
import { blogDefaultValue, blogInitValue } from '@/lib/constants';
import { categories } from '@/lib/helpers';
import {
  blogAtom,
  fileAtoms,
  imageAtoms,
  imageCountAtoms,
  pendingImgAtoms,
  previewImgAtoms,
} from '@/lib/jotai/blog-atoms';
import { editorContentAtom } from '@/lib/jotai/editor-atoms';
import { BlogSchema, blogSchema } from '@/lib/schemas/blog-schemas';
import { BlogFormValues, FormType } from '@/lib/types';
import { useUploadThing } from '@/lib/uploadthing';
import {
  cn,
  extractImageUrls,
  extractImageUrlsFromContent,
  replaceImageSourcesAndIdsDOMBased,
} from '@/lib/utils';
import { Post } from '@prisma/client';
import { useAtom } from 'jotai';
import { Loader } from 'lucide-react';
import slugify from 'slugify';
import { toast } from 'sonner';

import { ImagePreview } from '../rich-text-editor/image-preview';
import { RichTextEditor } from '../rich-text-editor/rich-text-editor';
import Editor from '../tiptap/editor';
import { Toolbar } from '../tiptap/toolbar';
import BlogContent from './blog-content';

type CreatePostFormProps = {
  type: FormType;
  blogValue?: BlogFormValues[];
  blogId?: string;
  slug?: string;
  blog?: Post;
};

type ImageInfo = {
  src: string;
  id: string;
  alt: string;
};

export default function PostForm({
  type,
  blogValue,
  blogId,
  slug,
  blog,
}: CreatePostFormProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
  const [formData, setFormData] = useAtom(blogAtom);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [images, setImages] = useAtom(imageAtoms);
  const [imageCount, setImageCount] = useAtom(imageCountAtoms);
  const [imageFiles, setImageFiles] = useAtom(fileAtoms);
  const [prevImg, setPrevImg] = useAtom(previewImgAtoms);
  const [content, setContent] = useAtom(editorContentAtom);
  useClearDataOnRoute();

  const resolvedDefaults = {
    title: type === 'update' ? formData?.title : '',
    slug: type === 'update' ? formData?.slug : '',
    category: type === 'update' ? formData?.category : '',
    content: type === 'update' ? formData?.content : content,
    anonymous: type === 'update' ? formData?.anonymous : false,
    images: type === 'update' ? formData?.images : [],
  };

  const methods = useZodForm({
    schema: blogSchema,
    mode: 'onTouched',
    defaultValues: resolvedDefaults,
  });

  const {
    formState: { errors: formErrors, isValid, isSubmitting },
    getValues,
    setValue,
  } = methods;

  useEffect(() => {
    if (type === 'update' && formData) {
      const imgs = formData.images.map((img) => img);
      setPrevImg(formData.images);
      setValue('title', formData.title);
      setValue('slug', formData.slug);
      setValue('category', formData.category);
      setValue('anonymous', formData.anonymous);
      setValue('images', imgs);
      setValue('content', formData.content);

      const multi = getValues(['category', 'images']);
    } else {
      setValue('content', content);
    }
  }, [formData, setValue, setPrevImg, type, getValues, content]);

  const hasErrors = Object.keys(formErrors).length > 0;
  const canSubmit = isValid && !isSubmitting;
  const showSubmitButton = !hasErrors;

  const contentHtml = type === 'create' ? content : formData.content;

  const fileToImageIdMap = new Map<File, string>();

  const handleContentChange = useCallback(
    (value: string) => {
      const { onChange } = methods.register('content', { required: true });

      methods.setValue('content', content);

      onChange({ target: { value } });

      setFormData((prev) => ({
        ...prev,
        content: value,
      }));
    },
    [methods, setFormData]
  );

  const { startUpload, routeConfig } = useUploadThing('imageUploader');

  useEffect(() => {
    if (formData.images.length > 0) {
      methods.setValue(
        'images',
        images.map((img) => (typeof img === 'string' ? img : ''))
      );

      if (blog?.images) {
        const newImg = blog.images.map((img) => ({
          src: img,
          id: img.split('/').pop() ?? '',
        }));
        setImages(newImg);
      }

      setValue('images', formData.images);
    }
  }, [images, methods.setValue, blog, methods, setImages]);

  useEffect(() => {
    const title = getValues('title');
    const slug = slugify(title);
    setValue('slug', slug);
    const imageUrl = extractImageUrlsFromContent(content);
    if (content || slug || imageUrl.length > 0) {
      setFormData((prev) => ({
        ...prev,
        content: content,
        slug: slug,
        images: imageUrl,
      }));

      setImages(
        imageUrl.map((url) => ({
          src: url,
          id: url.split('/').pop() || '',
        }))
      );
    }
  }, [formData.title, getValues, setValue, content]);

  useEffect(() => {}, []);
  const imagesData = formData.images;

  const onSubmit = async (data: BlogSchema) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let allImgUrls: ImageInfo[] = [];
      let newlyUploadedImages: ImageInfo[] = [];

      const urls = extractImageUrls(formData.content);

      const existingImgUrls = urls
        .filter((img) => img.src.startsWith('https'))
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

        newlyUploadedImages =
          uploaded?.map((file) => ({
            src: file.ufsUrl,
            id: file.key,
            alt: file.name,
          })) ?? [];

        allImgUrls = [...existingImgUrls, ...newlyUploadedImages];
      }
      const curImg = formData.images || [];

      const contentImageUrls = extractImageUrlsFromContent(formData.content);

      const stillUsedExistingImages = curImg.filter((imgUrl) =>
        contentImageUrls.includes(imgUrl)
      );

      const allImages = [
        ...stillUsedExistingImages,
        ...allImgUrls.map((img) => img.src),
      ];

      const uniqueImages = [...new Set(allImages)];

      const updatedContent = replaceImageSourcesAndIdsDOMBased(
        content,
        allImgUrls
      );
      const blogData = {
        ...data,
        content: updatedContent,
        images: allImgUrls.map((img) => img.src),
      };
      const updateBlogData = {
        ...data,
        id: blog?.id as string,
        content: updatedContent,
        images: allImgUrls.map((img) => img.src),
      };
      const response =
        type === 'create'
          ? await createNewBlog(blogData)
          : await updateBlog({
              ...updateBlogData,
              slug: formData.slug,
            });

      if (response?.error) {
        toast.error(response.message);
      } else {
        toast.success(
          `Blog ${type === 'create' ? 'created' : 'updated'} successfully!`
        );

        methods.reset(blogDefaultValue);
        setPendingImages([]);
        setImageFiles([]);
        setImageCount(0);
      }

      if (response?.error) {
        toast.error(response.message);
      } else {
        toast.success(
          `Blog ${type === 'create' ? 'created' : 'updated'} successfully!`
        );

        if (type === 'update') {
          const unusedImages = curImg.filter(
            (imgUrl) => !contentImageUrls.includes(imgUrl)
          );
          if (unusedImages.length > 0) {
            console.log('Unused images to delete:', unusedImages);
          }
        }

        if (type === 'create') {
          methods.reset(blogDefaultValue);
          setPendingImages([]);
          setImageFiles([]);
          setImageCount(0);
        } else {
          setPendingImages([]);

          setFormData((prev) => ({
            ...prev,
            ...blogData,
          }));
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    }
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setImages([]);
    setValue('title', '');
    setValue('slug', '');
    setValue('category', '');
    setValue('content', '');
    setFormData(blogInitValue);
    setPendingImages([]);
    setImageCount(0);
    setImageFiles([]);
    setImages([]);
    setErrors({});
  };

  const contentValue = methods.watch('content');

  const updateContent = useCallback(() => {
    if (editorRef?.current) {
      const newContent = editorRef.current.innerHTML;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newContent;
      tempDiv.className = 'editor-paragraph';
      tempDiv.classList.add('editor-paragraph');
      const images = tempDiv.querySelectorAll('img');
      setImageCount(images.length);

      if (handleContentChange) {
        handleContentChange(newContent);
      }
    }
  }, [setImageCount, handleContentChange]);

  const maxImages = 8;

  const { updateImageUrl, removeImageById } = useEditorImages(
    editorRef,
    maxImages,
    updateContent
  );

  const all = methods.watch();

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
                      {/* <pre>{JSON.stringify(field, null, 2)}</pre> */}
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
                              className='w-full flex-1'
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setFormData((prev) => ({
                                  ...prev,
                                  slug: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <p className='w-full text-center text-[10px] text-blue-300/40'>
                            ** Slug harus unik
                          </p>
                          {/* <pre>{JSON.stringify(field, null, 2)}</pre> */}
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
                  <FormItem
                    className='flex w-fit items-baseline'
                    key={field.name}
                  >
                    <FormLabel className='text-nowrap'>Category</FormLabel>
                    <Select
                      name={field.name}
                      key={field.value}
                      onValueChange={(value) => {
                        setValue('category', value);
                        field.onChange(value);
                        setFormData((prev) => ({
                          ...prev,
                          category: value,
                        }));
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                      </FormControl>
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

                    <FormMessage />
                    {/* <pre>{JSON.stringify(field.value, null, 2)}</pre> */}
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <FormField
              control={methods.control}
              name='content'
              rules={{ required: 'Content is required' }}
              render={({ field, fieldState }) => {
                return (
                  <FormItem>
                    <FormLabel>Content *</FormLabel>
                    <FormControl>
                      {/* <RichTextEditor
                        {...field}
                        fileToImageIdMap={fileToImageIdMap}
                        updateContent={updateContent}
                        editorRef={editorRef}
                        name='content'
                        startUpload={startUpload}
                        routeConfig={routeConfig}
                        onChange={(value) => {
                          field.onChange(value);
                          handleContentChange(value);
                        }}
                        placeholder=''
                        type={type}
                        error={methods.formState.errors.content?.message}
                      /> */}
                      <div>
                        {/* <ImagePreview
                          content={formData.content}
                          slug={formData.slug}
                          removeImageById={removeImageById}
                        />
                        <Toolbar /> */}
                        <Editor
                          {...field}
                          value={field.value || ''}
                          fileToImageIdMap={fileToImageIdMap}
                          updateContent={updateContent}
                          editorRef={editorRef}
                          startUpload={startUpload}
                          routeConfig={routeConfig}
                          onChange={(value) => {
                            field.onChange(value);
                            handleContentChange(value);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          type={type}
                          error={fieldState.error?.message}
                        />
                      </div>
                    </FormControl>
                    <pre className='w-3xl break-words whitespace-pre-wrap'>
                      {JSON.stringify(
                        { images, prevImg, contentHtml, field },
                        null,
                        2
                      )}
                    </pre>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <div className='pt-4'>
            <FormField
              control={methods.control}
              name='anonymous'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      className='dark:bg-accent'
                    />
                  </FormControl>
                  <div className=''>
                    <FormLabel className='text-base'>anonymous</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Form Actions */}
          <div className='flex gap-4 pt-2'>
            <Button
              type='submit'
              disabled={
                methods.formState.isSubmitting ||
                imageFiles.length > 3 ||
                !methods.formState.isValid
              }
              className='rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              {methods.formState.isSubmitting ? (
                <span className='flex items-center gap-2'>
                  <Loader size={26} className='animate-spin' />{' '}
                  {type === 'create' ? 'Creating...' : 'Updating...'}
                </span>
              ) : (
                <span>{type === 'create' ? 'Create Post' : 'Update Post'}</span>
              )}
            </Button>
            <Button
              type='button'
              variant={'ghost'}
              onClick={(e) => handleReset(e)}
              className={cn(
                'rounded-md bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none'
              )}
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>

      {/* Content Preview */}
      {formData.content && (
        <div className='mt-8 rounded-lg bg-gray-50 p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Content Preview
            {/* <pre>{JSON.stringify(contentValue, null, 2)}</pre> */}
          </h3>

          <BlogContent content={formData.content} />
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
              {formData.content}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
