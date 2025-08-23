import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormProps } from 'react-hook-form';
import * as z from 'zod';

export function useZodForm<TSchema extends z.ZodTypeAny>(
  props: Omit<UseFormProps<TSchema['_input']>, 'resolver'> & { schema: TSchema }
) {
  const form = useForm<TSchema['_input']>({
    ...props,
    resolver: async (data, context, options) => {
      const resolver = zodResolver(props.schema);
      const result = await resolver(data, context, options);

      console.log('formData', data);
      console.log('validation result', result);

      return result;
    },
  });

  return form;
}
