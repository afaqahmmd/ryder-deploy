import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({ instruction: z.string().min(3, 'Please provide a meaningful instruction') });

export default function SuggestInstructionModal({ isOpen, onClose, onSubmit, submitting = false }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { instruction: '' }
  });

  if (!isOpen) return null;

  const submit = async (values) => {
    await onSubmit(values.instruction);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-md p-4">
        <h3 className="text-lg font-semibold mb-3">Suggest improvement</h3>
        <form onSubmit={handleSubmit(submit)}>
          <textarea className="w-full border rounded p-2 h-28" placeholder="Explain how the AI response could be improved..." {...register('instruction')} />
          {errors.instruction && <p className="text-red-600 text-sm mt-1">{errors.instruction.message}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-3 py-2 border rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


