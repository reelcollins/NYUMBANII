import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/redux/features/authApiSlice';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/features/authSlice';

interface Query {
	uid: string; // Assuming 'uid' is a string type
  }

export default function useRegister() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [register, { isLoading }] = useRegisterMutation();

	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		phone_number: '',
		// otp_method: '',
		password: '',
		re_password: '',

	});

	// const { first_name, last_name, phone_number, otp_method, password, re_password } = formData;
	const { first_name, last_name, phone_number, password, re_password } = formData;

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;

		setFormData({ ...formData, [name]: value });
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
			register({ first_name, last_name, phone_number, password, re_password })	
		// register({ first_name, last_name, phone_number, otp_method, password, re_password })
			.unwrap()
			.then(() => {
				dispatch(setAuth());
				// const uid = response.data.uid; // Assuming the UID is in the 'data.uid' property
				// const uid = 123;
				toast.success('Account registered');
				router.push(`/home`);
				
			
				// Pass the UID to the OTP page
				// router.push(`/auth/register/{uid}`);
			  })
			  .catch(() => {
				toast.error('Failed to register');
			  });
	};

	return {
		first_name,
		last_name,
		phone_number,
		// otp_method,
		password,
		re_password,
		isLoading,
		onChange,
		onSubmit,
	};
}
