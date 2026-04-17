package dev.sandeep.rewatch.auth;

import dev.sandeep.rewatch.auth.model.UserItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

@Repository
public class UserRepository {

    private final DynamoDbTable<UserItem> table;
    private final DynamoDbIndex<UserItem> emailIndex;

    public UserRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("UserActivity", TableSchema.fromBean(UserItem.class));
        this.emailIndex = table.index("GSI3-EmailLookup");
    }

    public void putItem(UserItem item) {
        table.putItem(item);
    }

    public UserItem getUser(String userId) {
        return table.getItem(Key.builder().partitionValue("USER#" + userId).sortValue("#PROFILE").build());
    }

    public UserItem findByEmail(String email) {
        var results = emailIndex.query(QueryConditional.keyEqualTo(
                Key.builder().partitionValue("EMAIL#" + email).sortValue("USER").build()));

        for (var page : results) {
            for (var item : page.items()) {
                // GSI is KEYS_ONLY, so fetch full item from base table
                return table.getItem(Key.builder().partitionValue(item.getPk()).sortValue("#PROFILE").build());
            }
        }
        return null;
    }
}
