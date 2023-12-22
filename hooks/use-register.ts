import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/redux/features/authApiSlice';
import { toast } from 'react-toastify';

export default function useRegister() {
	const router = useRouter();
	const [register, { isLoading }] = useRegisterMutation();

	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		phone_number: '',
		otp_method: '',
		password: '',
		re_password: '',

	});

	const { first_name, last_name, phone_number, otp_method, password, re_password } = formData;

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;

		setFormData({ ...formData, [name]: value });
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		register({ first_name, last_name, phone_number, otp_method, password, re_password })
			.unwrap()
			.then(() => {
				toast.success('Account registered');
				// router.push('/auth/phone');
			})
			.catch(() => {
				toast.error('Failed to register');
			});
	};

	return {
		first_name,
		last_name,
		phone_number,
		otp_method,
		password,
		re_password,
		isLoading,
		onChange,
		onSubmit,
	};
}
