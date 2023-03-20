const url =
    'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';
const token = 'c0dc2986aad8567a4091fdb56fa0d2c126a61866';

const dataMapper = arr => {
    const output = arr.map(i => {
        return {
            type: i.data.type,
            mainInfo: [
                {
                    label: 'Короткое наименование: ',
                    value: i.data.name.short_with_opf || '',
                },
                {
                    label: 'Полное наименование: ',
                    value: i.data.name.full_with_opf || '',
                },
                {
                    label: 'ИНН / КПП',
                    value: `${i.data.inn} / ${i.data.kpp || ' - '}`,
                },
                { label: 'Адрес: ', value: i.data.address?.value || '' },
            ],
        };
    });

    return output;
};

const getCompanyData = async (query, count = 20) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Token ' + token,
            },
            body: JSON.stringify({ query, count }),
        });

        const data = await response.json();

        if (data.suggestions.length) {
            return dataMapper(data.suggestions);
        } else {
            return false;
        }
    } catch (e) {
        console.log(e);
    }
};

export { getCompanyData };
