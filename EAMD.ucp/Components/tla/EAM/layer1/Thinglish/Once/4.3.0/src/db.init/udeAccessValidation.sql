CREATE OR REPLACE FUNCTION udeAccessValidation (versionUDEID uuid, alias text, user_id text, user_roles text[], schema_access_group text[]) RETURNS text AS
$$
DECLARE
	ude_rec RECORD;
	right_object_group text;
	rightObject text;
	rightObjects RECORD;
	subquery RECORD;
begin
	--raise notice 'Input: %, %, %, %, %', versionUDEID, alias,  user_id, user_roles, schema_access_group;
    if versionUDEID is not null then
        --raise notice 'Use Version Search ';
    	SELECT INTO ude_rec *,
    		(particle->'_access'->>'owner')::uuid as udeowner
    		FROM ucp_domain_entity 
    	WHERE "version"= versionUDEID;
    else
        --raise notice 'Use Alias Search ';   
     	select INTO ude_rec distinct on ("ior_id") ude.*, 
     		(particle->'_access'->>'owner')::uuid as udeowner
     		FROM ucp_Domain_entity_alias udealias join ucp_domain_entity ude on udealias.ior = ude.ior_id 
    	WHERE udealias.alias_ior = alias
    	order by ior_id, "time" desc;
    end if;
    IF ude_rec.ior_id IS NULL then
       --raise notice 'Not found verion %', versionUDEID;
        RETURN false;
    END IF;
   	--raise notice 'found Record Version % => %', ude_rec."version", ude_rec;
	IF ude_rec.udeowner::text = user_id then
		--raise notice 'user is owner %', user_id;
		return true;
	end if;
	IF ude_rec.udeowner is null then
		--raise notice 'No accessGroups. It is free';
		return true;
	end if;
	 --raise notice 'Loop Access Group %', ude_rec."particle";
	 FOREACH right_object_group in array ARRAY_AGG(f) FROM ( SELECT json_object_keys(ude_rec.particle->'_access') f ) u 
	 loop
		--raise notice 'accessGroup  %', right_object_group; 
	 	if (array_length(schema_access_group,1) is null or right_object_group = any(schema_access_group) ) then
	     	if right_object_group != 'owner' then
				select into rightObjects * from ( SELECT ude_rec.particle->'_access'->right_object_group x)  xx ; 
				--raise notice 'rightObjects  %', rightObjects.x; 
				if (json_array_length(rightObjects.x) > 0) then
					--raise notice 'loop  rightObjects'; 
					FOREACH rightObject in array ARRAY_AGG(h) FROM (select json_array_elements_text(ude_rec.particle->'_access'->right_object_group) h ) x
					loop
					--raise notice 'rightObject  %', rightObject;
						if user_id::text = rightObject then
							--raise notice 'Match User in  accessGroup % with %', right_object_group, rightObject;
							return true;
						end if;
						if (rightObject = any(user_roles)) then
							--raise notice 'Match User in accessGroup % with %', right_object_group, rightObject;
							return true;
						end if;
						if (rightObject like 'ior:ude:%') then
							--raise notice 'Match Sub UDE';
							select into subquery * from (select udeAccessValidation(null, regexp_replace(rightObject, '^.*/([^/]+)$','\1'),user_id,user_roles, array[right_object_group]) r)  yy;
							if subquery.r = true::text then
								--raise notice 'get true from sub query';
								return true;
							else
								--raise notice 'get sub query result: %' , subquery.r;
							end if;
						end if;
					end loop; 
				end if;
			end if;
		end if;
     end loop;
   return false;
END;
$$
LANGUAGE plpgsql;