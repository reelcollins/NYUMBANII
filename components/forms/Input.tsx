import { ChangeEvent } from 'react';
import Link from 'next/link';

interface Props {
	labelId: string;
	placeholder: string;
	type: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	value: string;
	children: React.ReactNode;
	link?: {
		linkText: string;
		linkUrl: string;
	};
	required?: boolean;
	options?: { value: string; label: string }[];
}

export default function Input({
	labelId,
	placeholder,
	type,
	onChange,
	value,
	children,
	link,
	required = false,
	options,
}: Props) {
	if (type === 'radio') {
		return (
		  <div className="mt-2">
			<label
					htmlFor={labelId}
					className='block text-sm font-medium leading-6 text-gray-900'
			>
				{children}
			</label>
			{options?.map((option) => (
			  <div key={option.value} className="flex items-center">
				<input
				  type="radio"
				//   className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
				  id={`${labelId}-${option.value}`}
				  name={labelId} // Ensure all radio buttons have the same name
				  value={option.value}
				  checked={value === option.value}
				  onChange={onChange}
				/>
				<label htmlFor={`${labelId}-${option.value}`} className="ml-2">{option.label}</label>
			  </div>
			))}
		  </div>
		);
	  }

	  if (type === 'checkbox') {
		return (
		  <div className="mt-2">
			<label
					htmlFor={labelId}
					className='block text-sm font-medium leading-6 text-gray-900'
			>
				{children}
			</label>
			<div className="flex items-center">
			  <input
				type="checkbox"
				id={labelId}
				name={labelId}
				checked={value === 'true'} // Assuming 'true' or 'false' values for checkboxes
				onChange={(e) => onChange({ ...e, target: { ...e.target, value: e.target.checked.toString() } })}
			  />
			  
			</div>
		  </div>
		);
	  }

	  if (type === 'select') {
		return (
		  <div className="mt-2">
			<label htmlFor={labelId} className="block text-sm font-medium leading-6 text-gray-900">
			  {children}
			</label>
			<div className="mt-1">
			  <select
				id={labelId}
				name={labelId}
				value={value}
				onChange={(e) => onChange(e as ChangeEvent<HTMLInputElement | HTMLSelectElement>)}
				className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
			  >
				<option value="" disabled>
				  Select an option
				</option>
				{options?.map((option) => (
				  <option key={option.value} value={option.value}>
					{option.label}
				  </option>
				))}
			  </select>
			</div>
		  </div>
		);
	  }
	return (
		<div>
			<div className='flex justify-between align-center'>
				<label
					htmlFor={labelId}
					className='block text-sm font-medium leading-6 text-gray-900'
				>
					{children}
				</label>
				{link && (
					<div className='text-sm'>
						<Link
							className='font-semibold text-indigo-600 hover:text-indigo-500'
							href={link.linkUrl}
						>
							{link.linkText}
						</Link>
					</div>
				)}
			</div>
			<div className='mt-2'>
				<input
					id={labelId}
					className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
					name={labelId}
					placeholder={placeholder}
					type={type}
					onChange={onChange}
					value={value}
					required={required}
				/>
			</div>
		</div>
	);
}
