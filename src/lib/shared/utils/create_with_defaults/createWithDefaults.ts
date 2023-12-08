type OptionalKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type Defaults<T> = Required<Pick<T, OptionalKeys<T>>>;

function createWithDefaults<T>(options: T, defaults: Defaults<T>) {
    return Object.assign({}, defaults, options) as Required<T>;
}

export default createWithDefaults;
