'use client';

import { useConfirmOtp } from '@/hooks';
import { Form } from '@/components/forms';

interface Props {
	uid: string;
}

export default function OtpForm({ uid }: Props) {
// export default function OtpForm() {
	const { otp, isLoading, onChange, onSubmit } =
    useConfirmOtp(uid);

	const config = [
		{
			labelText: 'OTP code',
			labelId: 'otp',
			placeholder: '****',
			type: 'text',
			onChange,
			value: otp,
			required: true,
		},

	];

	return (
		<Form
			config={config}
			isLoading={isLoading}
			btnText='Submit'
			onChange={onChange}
			onSubmit={onSubmit}
		/>
	);
}
