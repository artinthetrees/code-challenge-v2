from rest_framework import serializers

from map.models import CommunityArea, RestaurantPermit

"""
        TODO: supplement each community area object with the number
        of permits issued in the given year.

        e.g. The endpoint /map-data/?year=2017 should return something like:
        [
            {
                "ROGERS PARK": {
                    area_id: 17,
                    num_permits: 2
                },
                "BEVERLY": {
                    area_id: 72,
                    num_permits: 2
                },
                ...
            }
        ]
        """


class CommunityAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityArea
        fields = ["name", "area_id","num_permits"]

    num_permits = serializers.SerializerMethodField(method_name='get_num_permits')
    #percent_permits = serializers.SerializerMethodField(method_name='get_percent_permits')


    def get_num_permits(self, obj):

        current_area_id = obj.area_id
        current_year = self.context["year"]
        restaurant_permits = RestaurantPermit.objects.filter(community_area_id=current_area_id,issue_year=current_year)

        return restaurant_permits.count()
        
