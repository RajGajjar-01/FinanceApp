import CreateAccountForm from './create_account_form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

const AccountCards = () => {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <CreateAccountForm onAccountCreate={handleAccountCreate}>
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center justify-center h-[140px] p-3">
              <div className="text-3xl text-muted-foreground mb-2">+</div>
              <p className="text-sm font-medium text-muted-foreground text-center">
                Add New Account
              </p>
            </div>
          </Card>
        </CreateAccountForm>

        {accounts.map((account) => (
          <Card
            key={account.id}
            className="shadow-sm hover:shadow-md transition-shadow group relative"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              {editingAccountId === account.id ? (
                <>
                  <Input
                    value={editingAccountName}
                    onChange={(e) => setEditingAccountName(e.target.value)}
                    className="text-sm font-medium capitalize mr-2 h-7"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setAccounts((prev) =>
                          prev.map((acc) =>
                            acc.id === account.id ? { ...acc, name: editingAccountName } : acc
                          )
                        );
                        setEditingAccountId(null);
                      }
                      if (e.key === 'Escape') setEditingAccountId(null);
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setAccounts((prev) =>
                        prev.map((acc) =>
                          acc.id === account.id ? { ...acc, name: editingAccountName } : acc
                        )
                      );
                      setEditingAccountId(null);
                    }}
                  >
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditingAccountId(null)}
                  >
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-medium capitalize">{account.name}</CardTitle>
                    <button
                      className="p-0 hover:bg-transparent focus:outline-none"
                      onClick={() => {
                        setEditingAccountId(account.id);
                        setEditingAccountName(account.name);
                      }}
                      aria-label={`Edit ${account.name}`}
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </div>

                  <Switch
                    checked={account.isDefault}
                    onCheckedChange={() => handleDefaultChange(account.id)}
                  />
                </>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${parseFloat(account.balance).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
              </p>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                Income
              </div>
              <div className="flex items-center">
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                Expense
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default AccountCards;
