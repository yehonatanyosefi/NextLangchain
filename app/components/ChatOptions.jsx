export default function ChatOptions({ chatOptions, handleChatOptionsChange }) {
	const { streaming, queryVector, memoryOption, temperature, useAgent, agentPrompt } = chatOptions
	const chatOptionsList = [
		{
			optionName: 'Streaming',
			isChecked: streaming,
			handleChange: () => handleChatOptionsChange({ streaming: !streaming }),
		},
		{
			optionName: 'Vector DB',
			isChecked: queryVector,
			handleChange: () => handleChatOptionsChange({ queryVector: !queryVector }),
		},
		{
			optionName: 'Memory',
			isChecked: memoryOption,
			handleChange: () => handleChatOptionsChange({ memoryOption: !memoryOption }),
		},
		{
			optionName: 'Creative',
			isChecked: temperature > 0,
			handleChange: () => handleChatOptionsChange({ temperature: temperature > 0 ? 0 : 0.9 }),
		},
		{
			optionName: 'Use Agent',
			isChecked: useAgent,
			handleChange: () => handleChatOptionsChange({ useAgent: !useAgent }),
		},
	]
	return (
		<>
			<div>ChatOptions</div>
			{chatOptionsList.map((option) => (
				<CheckBoxInput
					key={option.optionName}
					optionName={option.optionName}
					isChecked={option.isChecked}
					handleChange={option.handleChange}
				/>
			))}
			{useAgent && (
				<div>
					Agent Prompt:{'  '}
					<input
						type="text"
						value={agentPrompt}
						onChange={(e) => handleChatOptionsChange({ agentPrompt: e.target.value })}
					/>
				</div>
			)}
		</>
	)
}
function CheckBoxInput({ optionName, isChecked, handleChange }) {
	return (
		<div>
			{optionName}:{' '}
			<input type="checkbox" checked={isChecked} onChange={handleChange} name={optionName} />
		</div>
	)
}
