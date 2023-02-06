declare type Result<R> = { isError: false; value: R };
declare type Faillure<E> = { isError: true; value: E };
declare type Failable<R, E> = Result<R> | Faillure<E>;
