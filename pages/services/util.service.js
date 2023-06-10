export const utilService = {
	shallowEqual,
}

function shallowEqual(object1, object2) {
	if (
		object1 === null ||
		object2 === null ||
		typeof object1 === 'undefined' ||
		typeof object2 === 'undefined' ||
		typeof object1 !== 'object' ||
		typeof object2 !== 'object'
	)
		return false

	const keys1 = Object.keys(object1)
	const keys2 = Object.keys(object2)

	if (keys1.length !== keys2.length) {
		return false
	}

	for (let key of keys1) {
		if (object1[key] !== object2[key]) {
			return false
		}
	}

	return true
}
